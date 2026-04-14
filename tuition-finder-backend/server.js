const http = require("http");

const { env } = require("./src/config/env");
const { connectDB } = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");
const app = require("./app");

async function start() {
  await connectDB();
  try {
    if (env.REDIS_URL) {
      await connectRedis();
    }
  } catch (err) {
    console.error("Failed to connect to Redis (continuing without it):", err?.message || err);
  }

  const server = http.createServer(app);

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(`Port ${env.PORT} is already in use. Stop the other process or change PORT in .env.`);
      process.exit(1);
    }
    console.error(err);
    process.exit(1);
  });

  server.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
