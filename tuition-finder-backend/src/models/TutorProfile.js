const mongoose = require("mongoose");

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Nepali",
  "Science",
  "Computer Science",
  "Social Studies",
  "Accounts",
];

const GRADES = ["1-5", "6-8", "9-10", "+2/A Level", "Bachelor"];

const AREAS = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Butwal",
  "Biratnagar",
  "Online",
];

const AVAILABILITY = ["Weekday mornings", "Weekday evenings", "Weekends"];

const tutorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    bio: String,
    degree: String,
    university: String,
    experienceYears: Number,
    studentCount: { type: Number, default: 0 },
    hourlyRate: { type: Number, required: true },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    subjects: [
      {
        subject: { type: String, enum: SUBJECTS },
        gradeRange: { type: String, enum: GRADES },
      },
    ],
    availability: [{ type: String, enum: AVAILABILITY }],
    area: { type: String, enum: AREAS },
    alsoTeachesOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TutorProfile", tutorProfileSchema);
