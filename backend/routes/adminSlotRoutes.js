const express = require("express");
const MealSlot = require("../models/MealSlot");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/* ================= CREATE SLOT ================= */
router.post("/slots", adminAuth, async (req, res) => {
  try {
    const { mealType, floor, date, startTime, endTime, capacity } = req.body;

    const slot = await MealSlot.create({
      mealType,
      floor,
      date,
      startTime,
      endTime,
      capacity,
      bookedCount: 0
    });

    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: "Error creating slot" });
  }
});

/* ================= GET ALL SLOTS ================= */
router.get("/slots", adminAuth, async (req, res) => {
  try {
    const slots = await MealSlot.find().sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: "Error fetching slots" });
  }
});

/* ================= DELETE SLOT ================= */
router.delete("/slots/:id", adminAuth, async (req, res) => {
  try {
    await MealSlot.findByIdAndDelete(req.params.id);
    res.json({ message: "Slot deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting slot" });
  }
});

module.exports = router;
