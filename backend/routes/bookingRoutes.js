const express = require("express");
const Booking = require("../models/Booking");
const MealSlot = require("../models/MealSlot");
const QRCode = require("qrcode");
const studentAuth = require("../middleware/studentAuth");

const router = express.Router();
const CUTOFF_MINUTES = 15;

/* =========================================================
   🟢 CREATE BOOKING (STUDENT LOGGED IN)
   POST /api/bookings/create
========================================================= */
router.post("/create", studentAuth, async (req, res) => {
  try {
    const studentId = req.student._id;
    const { mealType } = req.body;

    // ❌ Prevent duplicate booking
    const existing = await Booking.findOne({
      student: studentId,
      mealType,
      status: "active"
    });
    if (existing) return res.status(400).json({ error: "Meal already booked" });

    // 🔍 Get all slots for meal + floor
    const slots = await MealSlot.find({
      mealType,
      floor: req.student.floor
    }).sort({ startTime: 1 });

    // 🎯 Pick first slot with available capacity
    let slot = null;
    for (const s of slots) {
      if (s.bookedCount < s.capacity) {
        slot = s;
        break;
      }
    }

    if (!slot) return res.status(404).json({ error: "No available slot" });

    // ⏱ Cutoff time check
    const now = new Date();
    const [h, m] = slot.startTime.split(":").map(Number);
    const cutoff = new Date();
    cutoff.setHours(h, m - CUTOFF_MINUTES, 0, 0);

    if (now > cutoff) {
      return res.status(400).json({ error: "Booking closed for this slot" });
    }

    // 🔼 Increase booked count
    slot.bookedCount += 1;
    await slot.save();

    // 📝 Create booking
    const booking = new Booking({
      student: studentId,
      slot: slot._id,
      mealType,
      floor: req.student.floor
    });

    await booking.save();

    // 🔐 Generate QR string
    const qrString = `BOOK-${booking._id}-${Date.now()}`;
    booking.qrCode = qrString;
    await booking.save();

    const qrImage = await QRCode.toDataURL(qrString);

    res.status(201).json({
      message: "Meal booked successfully",
      booking: {
        id: booking._id,
        mealType,
        floor: booking.floor,
        slotTime: `${slot.startTime} - ${slot.endTime}`
      },
      qrCode: qrImage
    });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================================================
   🟢 SCAN QR CODE AT MESS GATE
   POST /api/bookings/scan
========================================================= */
router.post("/scan", async (req, res) => {
  try {
    const { qrCode } = req.body;

    const booking = await Booking.findOne({ qrCode })
      .populate("student")
      .populate("slot");

    if (!booking) return res.status(404).json({ error: "Invalid QR" });
    if (booking.qrUsed) return res.status(400).json({ error: "QR already used" });
    if (booking.status !== "active") return res.status(400).json({ error: "Booking inactive" });

    const today = new Date().toISOString().split("T")[0];
    const bookingDate = booking.date.toISOString().split("T")[0];
    if (today !== bookingDate) return res.status(400).json({ error: "QR expired" });

    const now = new Date();
    const [sh, sm] = booking.slot.startTime.split(":").map(Number);
    const [eh, em] = booking.slot.endTime.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(sh, sm, 0);

    const endTime = new Date();
    endTime.setHours(eh, em, 0);

    if (now < startTime || now > endTime)
      return res.status(400).json({ error: "Outside valid time window" });

    booking.qrUsed = true;
    await booking.save();

    res.json({
      message: "ENTRY ALLOWED",
      student: booking.student.name,
      mealType: booking.mealType,
      floor: booking.floor
    });

  } catch (err) {
    console.error("Scan error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
