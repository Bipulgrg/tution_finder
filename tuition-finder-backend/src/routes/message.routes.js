const express = require("express");

const controller = require("../controllers/message.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/conversations", authMiddleware, controller.listConversations);
router.post("/conversations", authMiddleware, controller.createConversation);
router.get("/conversations/:conversationId", authMiddleware, controller.getConversationMessages);
router.post("/conversations/:conversationId/messages", authMiddleware, controller.sendMessage);

module.exports = router;
