const router = require("express").Router();
const Student = require("../models/Student");
const { login } = require("../services/authService");
const rateLimit = require("../middleware/rateLimit");
router.post(
  "/auth/login",
  rateLimit({
    keyFor: (req) =>
      req.ip +
      ":" +
      (typeof req.body.rollNo === "string"
        ? req.body.rollNo.trim().toUpperCase().slice(0, 100)
        : "invalid"),
  }),
  async (req, res) =>
    res.json({ token: await login(Student, "rollNo", req.body, "student") }),
);
module.exports = router;
