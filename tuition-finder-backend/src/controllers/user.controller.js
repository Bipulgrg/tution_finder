const { apiResponse } = require("../utils/apiResponse");
const { ApiError } = require("../utils/apiError");

const User = require("../models/User");
const TutorProfile = require("../models/TutorProfile");

const { hashPassword, verifyPassword } = require("../services/auth.service");
const { uploadToCloudinary } = require("../middleware/upload.middleware");

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    let tutorProfile = null;
    if (user.role === "tutor") {
      tutorProfile = await TutorProfile.findOne({ userId: user._id });
    }

    return res.json(apiResponse({ data: { user, tutorProfile } }));
  } catch (err) {
    return next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name, phone } = req.body;

    const hasName = typeof name === "string" && name.trim().length > 0;
    const hasPhone = typeof phone === "string" && phone.trim().length > 0;

    if (!hasName && !hasPhone) {
      throw new ApiError(400, "VALIDATION_ERROR", "Provide at least name or phone");
    }

    if (hasName && typeof name !== "string") {
      throw new ApiError(400, "VALIDATION_ERROR", "Name must be a string");
    }

    if (hasPhone && phone.trim().length < 7) {
      throw new ApiError(400, "VALIDATION_ERROR", "Phone number is too short");
    }

    const $set = {};
    if (hasName) $set.name = name.trim();
    if (hasPhone) $set.phone = phone.trim();

    const user = await User.findByIdAndUpdate(req.user._id, { $set }, { new: true }).select(
      "-password -refreshToken"
    );

    return res.json(apiResponse({ data: { user } }));
  } catch (err) {
    return next(err);
  }
}

async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) throw new ApiError(400, "VALIDATION_ERROR", "Photo is required");

    const url = await uploadToCloudinary(req.file.buffer, "tuition-finder/avatars");

    await User.findByIdAndUpdate(req.user._id, { $set: { profilePhotoUrl: url } });

    return res.json(apiResponse({ data: { profilePhotoUrl: url } }));
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "VALIDATION_ERROR", "currentPassword and newPassword required");
    }

    const user = await User.findById(req.user._id).select("+password");
    const ok = await verifyPassword(currentPassword, user.password);
    if (!ok) throw new ApiError(401, "INVALID_CREDENTIALS", "Current password incorrect");

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.json(apiResponse({ message: "Password updated" }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  me,
  updateMe,
  uploadPhoto,
  changePassword,
};
