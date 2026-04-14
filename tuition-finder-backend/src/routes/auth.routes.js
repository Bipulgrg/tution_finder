const express = require("express");

const controller = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate.middleware");
const { loginRateLimit, otpRateLimitByEmail } = require("../middleware/rateLimit.middleware");

const {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
} = require("../validators/auth.validator");

const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", otpRateLimitByEmail(), validate(registerSchema), controller.register);
router.post("/verify-email", validate(verifyEmailSchema), controller.verifyEmail);
router.post("/login", loginRateLimit, validate(loginSchema), controller.login);
router.post("/refresh", validate(refreshSchema), controller.refresh);
router.post("/logout", authMiddleware, controller.logout);
router.post("/forgot-password", otpRateLimitByEmail(), validate(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), controller.resetPassword);
router.post("/resend-otp", otpRateLimitByEmail(), validate(resendOtpSchema), controller.resendOtp);

module.exports = router;
