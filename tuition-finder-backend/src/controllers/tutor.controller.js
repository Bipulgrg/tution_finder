const mongoose = require("mongoose");

const { apiResponse } = require("../utils/apiResponse");
const { ApiError } = require("../utils/apiError");

const User = require("../models/User");
const TutorProfile = require("../models/TutorProfile");
const Review = require("../models/Review");
const Booking = require("../models/Booking");

async function listTutors(req, res, next) {
  try {
    const {
      subject,
      gradeRange,
      area,
      minRate,
      maxRate,
      availability,
      isOnline,
      search,
      page = 1,
      limit = 10,
      sortBy,
    } = req.query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;

    const match = { isApproved: true };
    if (area) match.area = area;
    if (availability) match.availability = availability;
    if (typeof isOnline !== "undefined") {
      if (isOnline === "true" || isOnline === true) match.isOnline = true;
      if (isOnline === "false" || isOnline === false) match.isOnline = false;
    }
    if (minRate) match.hourlyRate = { ...(match.hourlyRate || {}), $gte: Number(minRate) };
    if (maxRate) match.hourlyRate = { ...(match.hourlyRate || {}), $lte: Number(maxRate) };
    if (subject) match["subjects.subject"] = subject;
    if (gradeRange) match["subjects.gradeRange"] = gradeRange;

    const sort = {};
    if (sortBy === "rating") sort.ratingAvg = -1;
    else if (sortBy === "rate_asc") sort.hourlyRate = 1;
    else if (sortBy === "rate_desc") sort.hourlyRate = -1;
    else if (sortBy === "newest") sort.createdAt = -1;
    else sort.createdAt = -1;

    const pipeline = [{ $match: match }];

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });
    pipeline.push({ $unwind: "$user" });
    pipeline.push({ $match: { "user.isActive": true, "user.isEmailVerified": true } });

    if (search) {
      pipeline.push({
        $match: {
          "user.name": { $regex: search, $options: "i" },
        },
      });
    }

    pipeline.push({
      $project: {
        _id: 1,
        userId: 1,
        bio: 1,
        degree: 1,
        university: 1,
        experienceYears: 1,
        studentCount: 1,
        hourlyRate: 1,
        ratingAvg: 1,
        reviewCount: 1,
        isOnline: 1,
        isApproved: 1,
        subjects: 1,
        availability: 1,
        area: 1,
        alsoTeachesOnline: 1,
        createdAt: 1,
        user: {
          _id: 1,
          name: 1,
          profilePhotoUrl: 1,
        },
      },
    });

    const countPipeline = [...pipeline, { $count: "total" }];
    const dataPipeline = [...pipeline, { $sort: sort }, { $skip: skip }, { $limit: l }];

    const [countRes, items] = await Promise.all([
      TutorProfile.aggregate(countPipeline),
      TutorProfile.aggregate(dataPipeline),
    ]);

    const totalCount = countRes[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / l) || 1;

    return res.json(
      apiResponse({
        data: items,
        meta: { totalCount, page: p, totalPages, limit: l },
      })
    );
  } catch (err) {
    return next(err);
  }
}

async function getTutor(req, res, next) {
  try {
    const { tutorId } = req.params;
    if (!mongoose.isValidObjectId(tutorId)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid tutorId");
    }

    const profile = await TutorProfile.findOne({ userId: tutorId, isApproved: true }).lean();
    if (!profile) throw new ApiError(404, "TUTOR_NOT_FOUND", "Tutor not found");

    const user = await User.findById(tutorId).select("name profilePhotoUrl role email phone");
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

    const reviews = await Review.find({ tutorId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({ path: "parentId", select: "name profilePhotoUrl" });

    return res.json(apiResponse({ data: { user, profile, reviews } }));
  } catch (err) {
    return next(err);
  }
}

async function createProfile(req, res, next) {
  try {
    const existing = await TutorProfile.findOne({ userId: req.user._id });
    if (existing) throw new ApiError(409, "PROFILE_ALREADY_EXISTS", "Profile already exists");

    const profile = await TutorProfile.create({
      userId: req.user._id,
      ...req.validated.body,
    });

    return res.json(apiResponse({ data: { profile } }));
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await TutorProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { ...req.validated.body } },
      { new: true }
    );

    if (!profile) throw new ApiError(404, "TUTOR_NOT_FOUND", "Tutor profile not found");

    return res.json(apiResponse({ data: { profile } }));
  } catch (err) {
    return next(err);
  }
}

async function toggleOnline(req, res, next) {
  try {
    const { isOnline } = req.validated.body;

    const profile = await TutorProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { isOnline } },
      { new: true }
    );

    if (!profile) throw new ApiError(404, "TUTOR_NOT_FOUND", "Tutor profile not found");

    return res.json(apiResponse({ data: { profile } }));
  } catch (err) {
    return next(err);
  }
}

async function stats(req, res, next) {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);

    const [bookings, tutorProfile] = await Promise.all([
      Booking.find({
        tutorId: req.user._id,
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: start },
      }),
      TutorProfile.findOne({ userId: req.user._id }),
    ]);

    const weeklySessionCount = bookings.length;

    const weeklyEarnings = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const totalStudents = tutorProfile?.studentCount || 0;

    return res.json(apiResponse({ data: { weeklyEarnings, weeklySessionCount, totalStudents } }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listTutors,
  getTutor,
  createProfile,
  updateProfile,
  toggleOnline,
  stats,
};
