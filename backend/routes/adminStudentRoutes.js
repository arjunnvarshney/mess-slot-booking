const express = require("express");
const Student = require("../models/Student");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/* ================= GET ALL STUDENTS ================= */
/**
 * GET /api/admin/students
 */
router.get("/students", adminAuth, async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .sort({ rollNo: 1 });

    res.json(students);
  } catch (err) {
    console.error("Fetch students error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


/* ================= DELETE STUDENT ================= */
/**
 * DELETE /api/admin/students/:id
 */
router.delete("/students/:id", adminAuth, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Delete student error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


/* ================= UPDATE STUDENT FLOOR ================= */
/**
 * PUT /api/admin/students/:id/floor
 */
router.put("/students/:id/floor", adminAuth, async (req, res) => {
  try {
    const { floor } = req.body;

    if (![1, 2].includes(floor)) {
      return res.status(400).json({ error: "Floor must be 1 or 2" });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { floor },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      message: "Student floor updated",
      student: {
        id: student._id,
        name: student.name,
        floor: student.floor
      }
    });

  } catch (err) {
    console.error("Update floor error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
