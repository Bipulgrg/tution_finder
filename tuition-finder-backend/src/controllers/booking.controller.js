const mongoose = require("mongoose");

const { apiResponse } = require("../utils/apiResponse");
const { ApiError } = require("../utils/apiError");

const Booking = require("../models/Booking");
const TutorProfile = require("../models/TutorProfile");
const Notification = require("../models/Notification");

const { createBookingRef } = require("../services/booking.service");

async function createBooking(req, res, next) {
  try {
    const { tutorId, subject, gradeRange, sessionDate, timeSlot, sessionType, durationHours } =
      req.validated.body;

    if (!mongoose.isValidObjectId(tutorId)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid tutorId");
    }

    const tutorProfile = await TutorProfile.findOne({ userId: tutorId });
    if (!tutorProfile) throw new ApiError(404, "TUTOR_NOT_FOUND", "Tutor not found");
    if (!tutorProfile.isApproved) throw new ApiError(403, "TUTOR_NOT_APPROVED", "Tutor not approved");

    const ratePerHour = tutorProfile.hourlyRate;
    const hours = durationHours || 1;
    const totalAmount = ratePerHour * hours;

    const booking = await Booking.create({
      bookingRef: createBookingRef(),
      parentId: req.user._id,
      tutorId,
      subject,
      gradeRange,
      sessionDate,
      timeSlot,
      sessionType,
      durationHours: hours,
      ratePerHour,
      totalAmount,
      status: "pending",
    });

    await Notification.create({
      userId: tutorId,
      type: "booking",
      title: "New booking request",
      body: `New booking request (${booking.bookingRef})`,
      data: { bookingId: booking._id },
    });

    return res.json(apiResponse({ data: { booking } }));
  } catch (err) {
    return next(err);
  }
}

async function listBookings(req, res, next) {
  try {
    const { status, upcoming, past, page = 1, limit = 10 } = req.query;
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;

    const filter = {};
    if (req.user.role === "parent") filter.parentId = req.user._id;
    if (req.user.role === "tutor") filter.tutorId = req.user._id;

    if (status) filter.status = status;

    const now = new Date();
    if (upcoming === "true") filter.sessionDate = { $gte: now };
    if (past === "true") filter.sessionDate = { $lt: now };

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .populate({ path: "parentId", select: "name profilePhotoUrl" })
        .populate({ path: "tutorId", select: "name profilePhotoUrl" }),
      Booking.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / l) || 1;

    return res.json(apiResponse({ data: items, meta: { page: p, totalPages, total, limit: l } }));
  } catch (err) {
    return next(err);
  }
}

async function getBooking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate({ path: "parentId", select: "name profilePhotoUrl" })
      .populate({ path: "tutorId", select: "name profilePhotoUrl" });

    if (!booking) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found");

    const isOwner =
      booking.parentId?._id?.toString() === req.user._id.toString() ||
      booking.tutorId?._id?.toString() === req.user._id.toString();

    if (!isOwner) throw new ApiError(403, "BOOKING_UNAUTHORIZED", "Not allowed");

    return res.json(apiResponse({ data: { booking } }));
  } catch (err) {
    return next(err);
  }
}

async function confirmBooking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found");
    if (booking.tutorId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "BOOKING_UNAUTHORIZED", "Not allowed");
    }

    booking.status = "confirmed";
    await booking.save();

    await Notification.create({
      userId: booking.parentId,
      type: "booking",
      title: "Booking confirmed",
      body: `Booking confirmed (${booking.bookingRef})`,
      data: { bookingId: booking._id },
    });

    return res.json(apiResponse({ data: { booking } }));
  } catch (err) {
    return next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found");

    const isOwner =
      booking.parentId.toString() === req.user._id.toString() ||
      booking.tutorId.toString() === req.user._id.toString();

    if (!isOwner) throw new ApiError(403, "BOOKING_UNAUTHORIZED", "Not allowed");

    booking.status = "cancelled";
    booking.cancellationReason = reason || "";
    await booking.save();

    const otherUserId =
      booking.parentId.toString() === req.user._id.toString() ? booking.tutorId : booking.parentId;

    await Notification.create({
      userId: otherUserId,
      type: "booking",
      title: "Booking cancelled",
      body: `Booking cancelled (${booking.bookingRef})`,
      data: { bookingId: booking._id },
    });

    return res.json(apiResponse({ data: { booking } }));
  } catch (err) {
    return next(err);
  }
}

async function completeBooking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found");
    if (booking.tutorId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "BOOKING_UNAUTHORIZED", "Not allowed");
    }

    booking.status = "completed";
    await booking.save();

    await Notification.create({
      userId: booking.parentId,
      type: "review",
      title: "Leave a review",
      body: `Please leave a review for booking (${booking.bookingRef})`,
      data: { bookingId: booking._id },
    });

    return res.json(apiResponse({ data: { booking } }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
};
