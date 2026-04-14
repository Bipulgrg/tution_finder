const express = require("express");

const controller = require("../controllers/booking.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");

const { createBookingSchema } = require("../validators/booking.validator");

const router = express.Router();

router.post("/", authMiddleware, requireRole("parent"), validate(createBookingSchema), controller.createBooking);
router.get("/", authMiddleware, controller.listBookings);
router.get("/:bookingId", authMiddleware, controller.getBooking);
router.put("/:bookingId/confirm", authMiddleware, requireRole("tutor"), controller.confirmBooking);
router.put("/:bookingId/cancel", authMiddleware, controller.cancelBooking);
router.put("/:bookingId/complete", authMiddleware, requireRole("tutor"), controller.completeBooking);

module.exports = router;
