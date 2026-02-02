const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

const router = express.Router();

/* ================= STUDENT LOGIN ================= */
router.post("/auth/login", async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    const student = await Student.findOne({ rollNo });
    if (!student) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { studentId: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
