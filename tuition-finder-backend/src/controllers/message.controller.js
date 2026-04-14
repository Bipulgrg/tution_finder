const { apiResponse } = require("../utils/apiResponse");
const { ApiError } = require("../utils/apiError");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

async function listConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate({ path: "participants", select: "name profilePhotoUrl" });

    return res.json(apiResponse({ data: conversations }));
  } catch (err) {
    return next(err);
  }
}

async function createConversation(req, res, next) {
  try {
    const { otherUserId } = req.body;
    if (!otherUserId) throw new ApiError(400, "VALIDATION_ERROR", "otherUserId required");

    let convo = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user._id, otherUserId],
        lastMessageAt: new Date(),
      });
    }

    return res.json(apiResponse({ data: { conversation: convo } }));
  } catch (err) {
    return next(err);
  }
}

async function getConversationMessages(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const convo = await Conversation.findById(conversationId);
    if (!convo) throw new ApiError(404, "CONVERSATION_NOT_FOUND", "Conversation not found");

    const isParticipant = convo.participants.some((p) => p.toString() === req.user._id.toString());
    if (!isParticipant) throw new ApiError(403, "FORBIDDEN", "Forbidden");

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 30));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(l),
      Message.countDocuments({ conversationId }),
    ]);

    await Message.updateMany(
      { conversationId, isRead: false, senderId: { $ne: req.user._id } },
      { $set: { isRead: true } }
    );

    const totalPages = Math.ceil(total / l) || 1;

    return res.json(apiResponse({ data: items, meta: { page: p, totalPages, total, limit: l } }));
  } catch (err) {
    return next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    if (!content) throw new ApiError(400, "VALIDATION_ERROR", "content required");

    const convo = await Conversation.findById(conversationId);
    if (!convo) throw new ApiError(404, "CONVERSATION_NOT_FOUND", "Conversation not found");

    const isParticipant = convo.participants.some((p) => p.toString() === req.user._id.toString());
    if (!isParticipant) throw new ApiError(403, "FORBIDDEN", "Forbidden");

    const msg = await Message.create({
      conversationId,
      senderId: req.user._id,
      content,
    });

    convo.lastMessage = content;
    convo.lastMessageAt = new Date();
    await convo.save();

    const other = convo.participants.find((p) => p.toString() !== req.user._id.toString());
    if (other) {
      await Notification.create({
        userId: other,
        type: "message",
        title: "New message",
        body: content,
        data: { conversationId: convo._id },
      });
    }

    return res.json(apiResponse({ data: { message: msg } }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listConversations,
  createConversation,
  getConversationMessages,
  sendMessage,
};
