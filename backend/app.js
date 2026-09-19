const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("node:crypto");
function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY_HOPS)
    app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
  const origins = (
    process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:4173"
  )
    .split(",")
    .map((s) => s.trim());
  app.use((req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.set({
      "X-Request-ID": req.requestId,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store",
    });
    next();
  });
  app.use(
    cors({
      origin: (origin, callback) =>
        callback(null, !origin || origins.includes(origin)),
    }),
  );
  app.use(express.json({ limit: "128kb" }));
  app.use((req, res, next) => {
    if (
      req.body !== undefined &&
      (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    )
      return res
        .status(400)
        .json({ error: "Request body must be a JSON object" });
    req.body ||= {};
    next();
  });
  app.get("/health", (req, res) =>
    res
      .status(mongoose.connection.readyState === 1 ? 200 : 503)
      .json({ ready: mongoose.connection.readyState === 1 }),
  );
  app.use(
    "/api/admin",
    require("./routes/diningRoutes")(require("./middleware/adminAuth"), true),
  );
  app.use(
    "/api/students",
    require("./routes/diningRoutes")(require("./middleware/studentAuth")),
  );
  app.use("/api/admin", require("./routes/adminRoutes"));
  app.use("/api/admin", require("./routes/adminStudentRoutes"));
  app.use("/api/admin", require("./routes/adminSlotRoutes"));
  app.use("/api/students", require("./routes/studentRoutes"));
  app.use("/api/students", require("./routes/studentAuthRoutes"));
  app.use("/api/bookings", require("./routes/bookingRoutes"));
  app.use("/api/slots", require("./routes/slotRoutes"));
  app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    let status = error.status || 500,
      message = error.message;
    if (error.code === 11000) {
      status = 409;
      message = "A matching record already exists";
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      status = 400;
      message = "Invalid input: check the submitted fields";
    }
    if (status >= 500) {
      console.error(
        JSON.stringify({
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          error: error.name,
          code: error.code,
        }),
      );
      message = "Unable to complete the request. Please retry";
    }
    res.status(status).json({ error: message, requestId: req.requestId });
  });
  return app;
}
module.exports = createApp;
