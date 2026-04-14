const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["parent", "tutor"], required: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    profilePhotoUrl: { type: String, default: null },
    refreshToken: { type: String, default: null, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
