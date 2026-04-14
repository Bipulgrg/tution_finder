const { apiResponse } = require("../utils/apiResponse");

const Notification = require("../models/Notification");

async function listNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, unreadOnly = "false" } = req.query;
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(50, Math.max(1, Number(limit) || 20));
    const skip = (p - 1) * l;

    const filter = { userId: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);

    const totalPages = Math.ceil(total / l) || 1;

    return res.json(
      apiResponse({
        data: items,
        meta: { page: p, totalPages, total, limit: l, unreadCount },
      })
    );
  } catch (err) {
    return next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { notificationId } = req.params;
    await Notification.updateOne({ _id: notificationId, userId: req.user._id }, { $set: { isRead: true } });
    return res.json(apiResponse({ message: "Updated" }));
  } catch (err) {
    return next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
    return res.json(apiResponse({ message: "Updated" }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listNotifications,
  markRead,
  markAllRead,
};
