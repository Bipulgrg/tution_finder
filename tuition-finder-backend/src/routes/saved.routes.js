const express = require("express");

const controller = require("../controllers/saved.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authMiddleware, requireRole("parent"), controller.listSaved);
router.post("/:tutorId", authMiddleware, requireRole("parent"), controller.saveTutor);
router.delete("/:tutorId", authMiddleware, requireRole("parent"), controller.removeSaved);

module.exports = router;
