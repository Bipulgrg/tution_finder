const { z } = require("zod");
const jwt = require("jsonwebtoken");

const { ApiError } = require("../utils/apiError");

function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.details ? err.details : {}),
    });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      issues: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: err.message,
    });
  }

  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Invalid id",
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Duplicate key",
    });
  }

  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "Internal server error",
  });
}

module.exports = { errorMiddleware };
