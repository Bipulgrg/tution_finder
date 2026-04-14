/* eslint-disable no-console */
const path = require("path");

// Load backend env (.env in tuition-finder-backend/)
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { connectDB } = require("../src/config/db");
const { hashPassword } = require("../src/services/auth.service");

const User = require("../src/models/User");
const TutorProfile = require("../src/models/TutorProfile");

const SEED_TAG = "[seed]";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

async function seedTutors({ count = 12, password = "Password@123" } = {}) {
  const tutorNames = [
    "Aarav Sharma",
    "Sita Khadka",
    "Rohan Thapa",
    "Priya Singh",
    "Niraj Koirala",
    "Anisha Rai",
    "Bikash Adhikari",
    "Sabina Gurung",
    "Suman Bhandari",
    "Kriti Shrestha",
    "Utsav Paudel",
    "Mina Tamang",
  ];

  const subjects = [
    { subject: "Mathematics", gradeRange: "6-8" },
    { subject: "Mathematics", gradeRange: "9-10" },
    { subject: "Physics", gradeRange: "+2/A Level" },
    { subject: "Chemistry", gradeRange: "+2/A Level" },
    { subject: "Biology", gradeRange: "9-10" },
    { subject: "English", gradeRange: "6-8" },
    { subject: "Computer Science", gradeRange: "Bachelor" },
    { subject: "Accounts", gradeRange: "+2/A Level" },
  ];

  const areas = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Online"];
  const availability = ["Weekday mornings", "Weekday evenings", "Weekends"];

  const passwordHash = await hashPassword(password);

  const toCreate = [];
  for (let i = 0; i < count; i++) {
    const name = tutorNames[i % tutorNames.length];
    const emailSafe = name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
    const email = `${emailSafe}.${i + 1}@seed.tuitionfinder.local`;
    toCreate.push({
      name: `${name} ${SEED_TAG}`,
      email,
      password: passwordHash,
      role: "tutor",
      isEmailVerified: true,
      isActive: true,
    });
  }

  // Upsert users by email to keep script idempotent
  const users = [];
  for (const u of toCreate) {
    const user = await User.findOneAndUpdate(
      { email: u.email },
      { $setOnInsert: u },
      { new: true, upsert: true }
    );
    users.push(user);
  }

  // Create tutor profiles if missing
  for (const user of users) {
    const exists = await TutorProfile.findOne({ userId: user._id });
    if (exists) continue;

    const pickedSubjects = uniqBy(
      [pick(subjects), pick(subjects), pick(subjects)],
      (s) => `${s.subject}:${s.gradeRange}`
    );

    await TutorProfile.create({
      userId: user._id,
      bio: `Friendly and patient tutor ${SEED_TAG}. Focused on clear explanations and exam prep.`,
      degree: pick(["BSc", "BBA", "BEng", "MSc"]),
      university: pick(["Tribhuvan University", "Kathmandu University", "Pokhara University"]),
      experienceYears: Math.floor(1 + Math.random() * 8),
      studentCount: Math.floor(Math.random() * 50),
      hourlyRate: Math.floor(300 + Math.random() * 1200),
      isOnline: Math.random() > 0.5,
      alsoTeachesOnline: true,
      isApproved: true,
      subjects: pickedSubjects,
      availability: uniqBy([pick(availability), pick(availability)], (x) => x),
      area: pick(areas),
    });
  }

  return { usersCreatedOrFound: users.length };
}

async function main() {
  const countArg = process.argv.find((a) => a.startsWith("--count="));
  const passwordArg = process.argv.find((a) => a.startsWith("--password="));

  const count = countArg ? Number(countArg.split("=")[1]) : 12;
  const password = passwordArg ? passwordArg.split("=")[1] : "Password@123";

  await connectDB();

  const res = await seedTutors({ count, password });

  console.log(`Seeded tutors: ${res.usersCreatedOrFound}`);
  console.log(`Login password for seeded tutors: ${password}`);
  console.log(`Seeded tutor emails look like: name.1@seed.tuitionfinder.local`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

