require("dotenv").config({
  path: require("node:path").join(__dirname, ".env"),
});
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const createApp = require("./app");
async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters");
  if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGINS)
    throw new Error("CORS_ORIGINS is required in production");
  if (
    process.env.TRUST_PROXY_HOPS &&
    !/^[1-9]\d?$/.test(process.env.TRUST_PROXY_HOPS)
  )
    throw new Error("TRUST_PROXY_HOPS must be a positive integer");
  await connectDB();
  const server = createApp().listen(process.env.PORT || 5000, () =>
    console.log("Mess booking API ready"),
  );
  const shutdown = () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
if (require.main === module)
  start().catch(async (error) => {
    console.error("Startup failed:", error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
module.exports = { start };
