const { z } = require("zod");

const subjectItem = z.object({
  subject: z.enum([
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
  ]),
  gradeRange: z.enum(["1-5", "6-8", "9-10", "+2/A Level", "Bachelor"]),
});

const profileCreateSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    degree: z.string().optional(),
    university: z.string().optional(),
    experienceYears: z.coerce.number().int().min(0).optional(),
    hourlyRate: z.coerce.number().min(0),
    subjects: z.array(subjectItem).min(1),
    availability: z
      .array(z.enum(["Weekday mornings", "Weekday evenings", "Weekends"]))
      .min(1),
    area: z.enum([
      "Kathmandu",
      "Lalitpur",
      "Bhaktapur",
      "Pokhara",
      "Butwal",
      "Biratnagar",
      "Online",
    ]),
    alsoTeachesOnline: z.boolean().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const profileUpdateSchema = profileCreateSchema.partial();

const onlineStatusSchema = z.object({
  body: z.object({
    isOnline: z.boolean(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  profileCreateSchema,
  profileUpdateSchema,
  onlineStatusSchema,
};
