const express = require("express");
const Student = require("../models/Student");
const studentAuth = require("../middleware/studentAuth");

const router = express.Router();

/* ================= CREATE STUDENT ================= */
router.post("/create", async (req, res) => {
  try {
    const { rollNo, name, hostel, password } = req.body;

    const floor = rollNo.endsWith("1") ? 1 : 2;

    const student = new Student({
      rollNo,
      name,
      hostel,
      floor,
      password
    });

    await student.save();

    res.status(201).json({ message: "Student created successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

/* ================= STUDENT PROFILE ================= */
router.get("/profile", studentAuth, (req, res) => {
  res.json(req.student);
});

module.exports = router;
