const express = require("express");
const MealSlot = require("../models/MealSlot");
const adminAuth = require("../middleware/adminAuth");
const studentAuth = require("../middleware/studentAuth");

const router = express.Router();

/**
 * Create slot (ADMIN ONLY)
 */
router.post("/create", adminAuth, async (req, res) => {
  try {
    const slot = new MealSlot(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get slots by meal and floor (public)
 */
router.get("/", async (req, res) => {
  try {
    const query = {};

    if (req.query.mealType) query.mealType = req.query.mealType;
    if (req.query.floor) query.floor = Number(req.query.floor);

    const slots = await MealSlot.find(query);
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Get today's slots for logged-in student (STUDENT ONLY)
 */
router.get("/today", studentAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const slots = await MealSlot.find({
      date: today,
      floor: req.student.floor
    }).sort({ startTime: 1 });

    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch today's slots" });
  }
});

module.exports = router;
