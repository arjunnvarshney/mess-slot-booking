const express = require("express");
const Admin = require("../models/Admin");
const Booking = require("../models/Booking");
const MealSlot = require("../models/MealSlot");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/* ================= ADMIN REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const existing = await Admin.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });

    await admin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Admin register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= ADMIN LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Admin login successful", token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= GET LOGGED IN ADMIN ================= */
router.get("/me", adminAuth, (req, res) => {
  res.json({
    message: "Admin authenticated",
    admin: { id: req.admin._id, username: req.admin.username }
  });
});

/* =========================================================
   🆕 TODAY STATS (DASHBOARD CARDS)
========================================================= */
router.get("/stats/today", adminAuth, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      date: { $gte: start, $lte: end },
      status: "active"
    });

    const stats = {
      breakfast: bookings.filter(b => b.mealType === "breakfast").length,
      lunch: bookings.filter(b => b.mealType === "lunch").length,
      dinner: bookings.filter(b => b.mealType === "dinner").length,
      totalStudents: new Set(bookings.map(b => b.student.toString())).size
    };

    res.json(stats);
  } catch (err) {
    console.error("Today stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================================================
   🆕 TODAY REPORT (FOR CSV EXPORT)
========================================================= */
router.get("/reports/today", adminAuth, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      date: { $gte: start, $lte: end }
    }).populate("student", "name rollNo hostel floor");

    res.json(bookings);
  } catch (err) {
    console.error("Report export error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= DAILY ANALYTICS ================= */
router.get("/analytics/daily", adminAuth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required (YYYY-MM-DD)" });

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const stats = await Booking.aggregate([
      { $match: { date: { $gte: start, $lte: end }, status: "active" } },
      {
        $group: {
          _id: "$mealType",
          totalBookings: { $sum: 1 },
          totalConsumed: { $sum: { $cond: ["$qrUsed", 1, 0] } }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    console.error("Daily analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= WEEKLY ANALYTICS ================= */
router.get("/analytics/weekly", adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const stats = await Booking.aggregate([
      { $match: { date: { $gte: sevenDaysAgo, $lte: today }, status: "active" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalBookings: { $sum: 1 },
          totalConsumed: { $sum: { $cond: ["$qrUsed", 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(stats);
  } catch (err) {
    console.error("Weekly analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= GET ALL BOOKINGS ================= */
router.get("/bookings", adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("student", "name rollNo hostel")
      .populate("slot", "mealType startTime endTime floor")
      .sort({ date: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Admin bookings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
