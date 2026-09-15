const router = require("express").Router();
const MealSlot = require("../models/MealSlot");
const studentAuth = require("../middleware/studentAuth");
const { today, isBookable } = require("../lib/domain");
router.get("/today", studentAuth, async (req, res) => {
  const now = new Date();
  const slots = await MealSlot.find({
    date: today(now),
    floor: req.student.floor,
    active: true,
  })
    .sort({ startTime: 1 })
    .lean();
  res.json(
    slots.map((slot) => ({
      ...slot,
      available: Math.max(0, slot.capacity - slot.bookedCount),
      bookable: isBookable(slot, now),
    })),
  );
});
module.exports = router;
