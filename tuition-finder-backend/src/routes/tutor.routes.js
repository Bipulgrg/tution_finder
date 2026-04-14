const express = require("express");

const controller = require("../controllers/tutor.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  profileCreateSchema,
  profileUpdateSchema,
  onlineStatusSchema,
} = require("../validators/tutor.validator");

const router = express.Router();

router.get("/", controller.listTutors);
router.get("/:tutorId", controller.getTutor);

router.post("/profile", authMiddleware, requireRole("tutor"), validate(profileCreateSchema), controller.createProfile);
router.put("/profile", authMiddleware, requireRole("tutor"), validate(profileUpdateSchema), controller.updateProfile);
router.put(
  "/profile/status",
  authMiddleware,
  requireRole("tutor"),
  validate(onlineStatusSchema),
  controller.toggleOnline
);
router.get("/profile/stats", authMiddleware, requireRole("tutor"), controller.stats);

module.exports = router;
