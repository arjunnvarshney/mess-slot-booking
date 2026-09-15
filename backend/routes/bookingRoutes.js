const router = require("express").Router();
const QRCode = require("qrcode");
const Booking = require("../models/Booking");
const studentAuth = require("../middleware/studentAuth");
const adminAuth = require("../middleware/adminAuth");
const rateLimit = require("../middleware/rateLimit");
const { check, id, pagination, today } = require("../lib/domain");
const service = require("../services/bookingService");
router.post("/create", studentAuth, async (req, res) => {
  const booking = await service.createBooking(
    req.student,
    req.body.mealType,
    req.body.slotId,
  );
  res.status(201).json({ message: "Meal booked successfully", booking });
});
router.get("/today", studentAuth, async (req, res) => {
  res.json(
    await Booking.find({
      student: req.student._id,
      serviceDate: today(),
      status: "active",
    }).lean(),
  );
});
router.get("/my", studentAuth, async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { student: req.student._id };
  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate("slot", "startTime endTime")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
});
router.get("/:id/qr", studentAuth, async (req, res) => {
  const booking = await Booking.findOne({
    _id: id(req.params.id),
    student: req.student._id,
  }).select("+qrCode");
  check(booking, "Booking not found", 404);
  check(
    booking.status === "active" &&
      !booking.qrUsed &&
      booking.serviceDate === today() &&
      booking.endAt > new Date(),
    "This pass is no longer valid",
    409,
  );
  res.set("Cache-Control", "no-store").json({
    qrCode: await QRCode.toDataURL(booking.qrCode, { width: 300, margin: 4 }),
  });
});
router.post("/:id/cancel", studentAuth, async (req, res) => {
  await service.cancelBooking(req.student._id, req.params.id);
  res.json({ message: "Booking cancelled and capacity released" });
});
router.post("/:id/reschedule", studentAuth, async (req, res) => {
  const booking = await service.rescheduleBooking(
    req.student,
    req.params.id,
    req.body.slotId,
  );
  res.json({ message: "Booking rescheduled", booking });
});
router.post(
  "/scan",
  adminAuth,
  rateLimit({ limit: 300, windowMs: 60000 }),
  async (req, res) => {
    res.json(await service.scanBooking(req.body.qrCode, req.admin._id));
  },
);
module.exports = router;
