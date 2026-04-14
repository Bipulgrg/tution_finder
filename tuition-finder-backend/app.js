const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");

const { env } = require("./src/config/env");
const { errorMiddleware } = require("./src/middleware/error.middleware");
const { generalRateLimit } = require("./src/middleware/rateLimit.middleware");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const tutorRoutes = require("./src/routes/tutor.routes");
const bookingRoutes = require("./src/routes/booking.routes");
const savedRoutes = require("./src/routes/saved.routes");
const reviewRoutes = require("./src/routes/review.routes");
const messageRoutes = require("./src/routes/message.routes");
const notificationRoutes = require("./src/routes/notification.routes");

const app = express();

app.use(helmet());
const allowedOrigins = (env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Non-browser clients (React Native, curl, Postman) typically send no Origin.
      if (!origin) return cb(null, true);

      // In development, be permissive to avoid Expo/Web origin churn.
      if (env.NODE_ENV === "development") return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize());
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.use(generalRateLimit);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorMiddleware);

module.exports = app;
