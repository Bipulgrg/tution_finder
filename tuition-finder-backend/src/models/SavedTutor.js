const mongoose = require("mongoose");

const savedTutorSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

savedTutorSchema.index({ parentId: 1, tutorId: 1 }, { unique: true });

module.exports = mongoose.model("SavedTutor", savedTutorSchema);
