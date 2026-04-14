const { getRedisOptional } = require("../config/redis");
const { ApiError } = require("../utils/apiError");

const memoryStore = new Map();

function setMemory(key, value, ttlSeconds) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryStore.set(key, { value, expiresAt });
}

function getMemory(key) {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

function delMemory(key) {
  memoryStore.delete(key);
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function setOtp({ key, otp, ttlSeconds }) {
  const redis = getRedisOptional();
  if (redis) {
    await redis.set(key, otp, { EX: ttlSeconds });
    return;
  }
  setMemory(key, otp, ttlSeconds);
}

async function verifyOtp({ key, otp }) {
  const redis = getRedisOptional();
  const stored = redis ? await redis.get(key) : getMemory(key);
  if (!stored) {
    throw new ApiError(400, "OTP_EXPIRED", "OTP expired");
  }
  if (stored !== otp) {
    throw new ApiError(400, "OTP_INVALID", "Invalid OTP");
  }
  if (redis) await redis.del(key);
  else delMemory(key);
  return true;
}

module.exports = { generateOtp, setOtp, verifyOtp };
