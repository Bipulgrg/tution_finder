const express = require("express");

const controller = require("../controllers/user.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/me", authMiddleware, controller.me);
router.put("/me", authMiddleware, controller.updateMe);
router.post("/me/photo", authMiddleware, upload.single("photo"), controller.uploadPhoto);
router.put("/me/change-password", authMiddleware, controller.changePassword);

module.exports = router;
