const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  // Comma-separated allowlist for CORS (mainly used for web).
  // Keep optional so local mobile/dev flows don't fail env validation.
  CLIENT_ORIGIN: z.string().optional().default(""),

  MONGODB_URI: z.string().min(1),
  // Optional: if empty, the app runs without Redis (in-memory fallback where supported).
  REDIS_URL: z.string().optional().default(""),

  ACCESS_TOKEN_SECRET: z.string().min(10),
  REFRESH_TOKEN_SECRET: z.string().min(10),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  FROM_EMAIL: z.string().min(1),

  CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal("")),
  CLOUDINARY_SECRET: z.string().optional().or(z.literal("")),
});

function loadEnv() {
  require("dotenv").config();
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    const err = new Error("Invalid environment variables");
    err.code = "ENV_VALIDATION_ERROR";
    err.issues = issues;
    throw err;
  }
  return parsed.data;
}

const env = loadEnv();

module.exports = { env };
