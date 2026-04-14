const express = require("express");

const controller = require("../controllers/review.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

router.post("/", authMiddleware, requireRole("parent"), controller.createReview);
router.get("/tutor/:tutorId", controller.listReviewsForTutor);

module.exports = router;
