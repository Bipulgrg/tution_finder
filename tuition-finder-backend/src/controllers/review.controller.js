const { apiResponse } = require("../utils/apiResponse");
const { ApiError } = require("../utils/apiError");

const Booking = require("../models/Booking");
const Review = require("../models/Review");
const TutorProfile = require("../models/TutorProfile");

async function createReview(req, res, next) {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found");
    if (booking.status !== "completed") {
      throw new ApiError(403, "REVIEW_NOT_ALLOWED", "Review only allowed after completion");
    }
    if (booking.parentId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "BOOKING_UNAUTHORIZED", "Not allowed");
    }

    const existing = await Review.findOne({ bookingId });
    if (existing) throw new ApiError(409, "BOOKING_ALREADY_REVIEWED", "Already reviewed");

    const review = await Review.create({
      bookingId,
      parentId: req.user._id,
      tutorId: booking.tutorId,
      rating,
      comment,
    });

    const agg = await Review.aggregate([
      { $match: { tutorId: booking.tutorId } },
      {
        $group: {
          _id: "$tutorId",
          ratingAvg: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const stats = agg[0] || { ratingAvg: 0, reviewCount: 0 };

    await TutorProfile.updateOne(
      { userId: booking.tutorId },
      { $set: { ratingAvg: stats.ratingAvg, reviewCount: stats.reviewCount } }
    );

    return res.json(apiResponse({ data: { review } }));
  } catch (err) {
    return next(err);
  }
}

async function listReviewsForTutor(req, res, next) {
  try {
    const { tutorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Review.find({ tutorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .populate({ path: "parentId", select: "name profilePhotoUrl" }),
      Review.countDocuments({ tutorId }),
    ]);

    const totalPages = Math.ceil(total / l) || 1;

    return res.json(apiResponse({ data: items, meta: { page: p, totalPages, total, limit: l } }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createReview,
  listReviewsForTutor,
};
