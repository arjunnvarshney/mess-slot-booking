const router = require("express").Router();
const mongoose = require("mongoose");
const MealSlot = require("../models/MealSlot");
const AuditLog = require("../models/AuditLog");
const adminAuth = require("../middleware/adminAuth");
const {
  slotInput,
  id,
  check,
  date,
  today,
  pagination,
} = require("../lib/domain");
router.use(adminAuth);
router.post("/slots", async (req, res) => {
  const input = slotInput(req.body);
  const slot = await mongoose.connection.transaction(async (session) => {
    const [slot] = await MealSlot.create([input], { session });
    await AuditLog.create(
      [
        {
          actor: req.admin._id,
          action: "slot.create",
          target: String(slot._id),
          details: input,
        },
      ],
      { session },
    );
    return slot;
  });
  res.status(201).json(slot);
});
router.get("/slots", async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { date: date(req.query.date || today()) };
  const [items, total] = await Promise.all([
    MealSlot.find(filter)
      .sort({ startTime: 1, floor: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MealSlot.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
});
router.put("/slots/:id", async (req, res) => {
  const capacity = Number(req.body.capacity);
  check(
    Number.isInteger(capacity) && capacity > 0 && capacity <= 10000,
    "Capacity must be between 1 and 10000",
  );
  check(typeof req.body.active === "boolean", "Active must be true or false");
  await mongoose.connection.transaction(async (session) => {
    const filter = { _id: id(req.params.id), bookedCount: { $lte: capacity } };
    if (!req.body.active) filter.bookedCount = 0;
    const slot = await MealSlot.findOneAndUpdate(
      filter,
      { $set: { capacity, active: req.body.active } },
      { session, returnDocument: "after", runValidators: true },
    );
    check(
      slot,
      "Slot not found, capacity is below reservations, or booked slot cannot be closed",
      409,
    );
    await AuditLog.create(
      [
        {
          actor: req.admin._id,
          action: "slot.update",
          target: String(slot._id),
          details: { capacity, active: req.body.active },
        },
      ],
      { session },
    );
  });
  res.json({ message: "Slot updated" });
});
module.exports = router;
