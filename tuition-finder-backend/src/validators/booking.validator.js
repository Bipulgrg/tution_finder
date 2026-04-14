const { z } = require("zod");

const createBookingSchema = z.object({
  body: z.object({
    tutorId: z.string().min(1),
    subject: z.string().min(1),
    gradeRange: z.string().min(1),
    sessionDate: z.coerce.date(),
    timeSlot: z.string().min(1),
    sessionType: z.enum(["in-person", "online"]),
    durationHours: z.coerce.number().min(1).max(8).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = { createBookingSchema };
