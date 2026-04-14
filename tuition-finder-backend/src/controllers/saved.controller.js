const { apiResponse } = require("../utils/apiResponse");
const { ApiError } = require("../utils/apiError");

const SavedTutor = require("../models/SavedTutor");

async function listSaved(req, res, next) {
  try {
    const items = await SavedTutor.find({ parentId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "tutorId", select: "name profilePhotoUrl" });

    return res.json(apiResponse({ data: items }));
  } catch (err) {
    return next(err);
  }
}

async function saveTutor(req, res, next) {
  try {
    const { tutorId } = req.params;
    await SavedTutor.updateOne(
      { parentId: req.user._id, tutorId },
      { $setOnInsert: { parentId: req.user._id, tutorId } },
      { upsert: true }
    );

    return res.json(apiResponse({ message: "Saved" }));
  } catch (err) {
    if (err?.code === 11000) {
      return res.json(apiResponse({ message: "Saved" }));
    }
    return next(err);
  }
}

async function removeSaved(req, res, next) {
  try {
    const { tutorId } = req.params;
    await SavedTutor.deleteOne({ parentId: req.user._id, tutorId });
    return res.json(apiResponse({ message: "Removed" }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listSaved,
  saveTutor,
  removeSaved,
};
