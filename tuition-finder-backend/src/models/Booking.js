const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, unique: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subject: String,
    gradeRange: String,
    sessionDate: Date,
    timeSlot: String,
    sessionType: { type: String, enum: ["in-person", "online"] },
    durationHours: { type: Number, default: 1 },
    ratePerHour: Number,
    totalAmount: Number,
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    cancellationReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
