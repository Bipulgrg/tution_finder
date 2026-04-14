const { createClient } = require("redis");

const { env } = require("./env");

let redisClient = null;
let redisConnected = false;

async function connectRedis() {
  if (redisClient) return redisClient;
  if (!env.REDIS_URL) return null;

  redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
      // Redis is optional; if it's not reachable we don't want retry spam.
      reconnectStrategy: false,
    },
  });

  // Prevent unhandled error event from crashing the process.
  redisClient.on("error", (err) => {
    // While connecting, node-redis can emit ECONNREFUSED errors repeatedly.
    // Only log errors after a successful connection.
    if (redisConnected) console.error("Redis client error:", err);
  });

  try {
    await redisClient.connect();
    redisConnected = true;
    console.log("Redis connected");
    return redisClient;
  } catch (err) {
    // Redis is optional for local dev. Keep it disabled if not reachable.
    try {
      await redisClient.quit();
    } catch {
      // ignore
    }
    redisClient = null;
    redisConnected = false;
    throw err;
  }
}

function getRedisOptional() {
  // Only return a usable client. If Redis isn't up, callers fall back.
  if (!redisClient) return null;
  if (typeof redisClient.isReady === "boolean") return redisClient.isReady ? redisClient : null;
  return redisClient;
}

module.exports = { connectRedis, getRedisOptional };

