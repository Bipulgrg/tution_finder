const express = require("express");

const controller = require("../controllers/notification.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, controller.listNotifications);
router.put("/read-all", authMiddleware, controller.markAllRead);
router.put("/:notificationId/read", authMiddleware, controller.markRead);

module.exports = router;
