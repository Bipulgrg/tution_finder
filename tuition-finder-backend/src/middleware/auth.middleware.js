const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const { ApiError } = require("../utils/apiError");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing token");
    }

    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(payload.sub).select("-password -refreshToken");
    if (!user) throw new ApiError(401, "USER_NOT_FOUND", "User not found");
    if (!user.isActive) throw new ApiError(401, "UNAUTHORIZED", "User inactive");
    if (!user.isEmailVerified) {
      throw new ApiError(401, "EMAIL_NOT_VERIFIED", "Email not verified");
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authMiddleware };
