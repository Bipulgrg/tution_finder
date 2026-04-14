const { getRedisOptional } = require("../config/redis");
const { ApiError } = require("../utils/apiError");

function getIp(req) {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function createRateLimiter({ keyPrefix, limit, windowSeconds }) {
  return async (req, res, next) => {
    try {
      const redis = getRedisOptional();
      if (!redis) return next();
      const ip = getIp(req);
      const key = `${keyPrefix}:${ip}`;

      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > limit) {
        return next(new ApiError(429, "RATE_LIMIT_EXCEEDED", "Too many requests"));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

const generalRateLimit = createRateLimiter({
  keyPrefix: "rl:general",
  limit: 100,
  windowSeconds: 60,
});

const loginRateLimit = createRateLimiter({
  keyPrefix: "rl:login",
  limit: 5,
  windowSeconds: 15 * 60,
});

function otpRateLimitByEmail() {
  return async (req, res, next) => {
    try {
      const redis = getRedisOptional();
      if (!redis) return next();
      const email = (req.body?.email || "").toString().toLowerCase();
      if (!email) return next();

      const key = `rl:otp:${email}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, 60 * 60);
      if (count > 3) {
        return next(new ApiError(429, "RATE_LIMIT_EXCEEDED", "Too many OTP requests"));
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  generalRateLimit,
  loginRateLimit,
  otpRateLimitByEmail,
};
