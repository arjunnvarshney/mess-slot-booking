const mongoose = require("mongoose");
const crypto = require("node:crypto");
const Booking = require("../models/Booking");
const MealSlot = require("../models/MealSlot");
const Student = require("../models/Student");
const {
  MEALS,
  CUTOFF_MINUTES,
  check,
  today,
  instant,
  isBookable,
  id,
  text,
} = require("../lib/domain");

async function reserve(student, mealType, preferredSlot, now, session) {
  check(MEALS.includes(mealType), "Invalid meal type");
  const serviceDate = today(now);
  // Serialize with student deactivation/floor changes in concurrent admin transactions.
  const current = await Student.findOneAndUpdate(
    { _id: student._id, active: { $ne: false } },
    { $inc: { __v: 1 } },
    { returnDocument: "after", session },
  );
  check(current, "Student is inactive", 403);
  const existing = await Booking.exists({
    student: current._id,
    mealType,
    serviceDate,
    status: "active",
  }).session(session);
  check(!existing, "This meal is already booked for today", 409);
  const query = {
    date: serviceDate,
    mealType,
    floor: current.floor,
    active: true,
  };
  if (preferredSlot) query._id = id(preferredSlot);
  const candidates = await MealSlot.find(query)
    .sort({ startTime: 1 })
    .session(session);
  let slot;
  for (const candidate of candidates) {
    if (!isBookable(candidate, now)) continue;
    slot = await MealSlot.findOneAndUpdate(
      {
        _id: candidate._id,
        active: true,
        $expr: { $lt: ["$bookedCount", "$capacity"] },
      },
      { $inc: { bookedCount: 1 } },
      { returnDocument: "after", session },
    );
    if (slot) break;
  }
  check(
    slot,
    "No bookable slot is available. Slots close 15 minutes before starting",
    409,
  );
  const [booking] = await Booking.create(
    [
      {
        student: current._id,
        slot: slot._id,
        mealType,
        floor: current.floor,
        serviceDate,
        date: instant(serviceDate),
        startAt: instant(serviceDate, slot.startTime),
        endAt: instant(serviceDate, slot.endTime),
        slotTime: slot.startTime + " – " + slot.endTime,
        studentSnapshot: {
          name: current.name,
          rollNo: current.rollNo,
          hostel: current.hostel,
        },
        qrCode: crypto.randomBytes(32).toString("base64url"),
      },
    ],
    { session },
  );
  const value = booking.toObject();
  delete value.qrCode;
  return value;
}
async function createBooking(student, mealType, slotId, now = new Date()) {
  return mongoose.connection.transaction((session) =>
    reserve(student, mealType, slotId, now, session),
  );
}
async function cancelWithin(studentId, bookingId, session, now = new Date()) {
  const booking = await Booking.findOneAndUpdate(
    {
      _id: id(bookingId),
      student: studentId,
      status: "active",
      qrUsed: false,
      startAt: { $gt: new Date(now.getTime() + CUTOFF_MINUTES * 60000) },
    },
    { $set: { status: "cancelled", cancelledAt: now } },
    { returnDocument: "after", session },
  );
  check(
    booking,
    "Booking cannot be changed: it is used, cancelled, unavailable, or past the cutoff",
    409,
  );
  const released = await MealSlot.updateOne(
    { _id: booking.slot, bookedCount: { $gt: 0 } },
    { $inc: { bookedCount: -1 } },
    { session },
  );
  check(
    released.modifiedCount === 1,
    "Capacity requires administrator reconciliation",
    409,
  );
  return booking;
}
async function cancelBooking(studentId, bookingId, now = new Date()) {
  return mongoose.connection.transaction((session) =>
    cancelWithin(studentId, bookingId, session, now),
  );
}
async function rescheduleBooking(student, bookingId, slotId, now = new Date()) {
  check(slotId, "Select a replacement slot");
  return mongoose.connection.transaction(async (session) => {
    const previous = await cancelWithin(student._id, bookingId, session, now);
    check(String(previous.slot) !== slotId, "Choose a different slot");
    return reserve(student, previous.mealType, slotId, now, session);
  });
}
async function scanBooking(code, adminId, now = new Date()) {
  const qrCode = text(code, "QR code", 200);
  const booking = await Booking.findOneAndUpdate(
    {
      qrCode,
      status: "active",
      qrUsed: false,
      serviceDate: today(now),
      startAt: { $lte: now },
      endAt: { $gt: now },
    },
    { $set: { qrUsed: true, usedAt: now, scannedBy: adminId } },
    { returnDocument: "after" },
  );
  check(
    booking,
    "QR is invalid, already used, cancelled, or outside its meal window",
    409,
  );
  return {
    message: "Entry allowed",
    student: booking.studentSnapshot?.name || "Student",
    mealType: booking.mealType,
    floor: booking.floor,
  };
}
module.exports = {
  createBooking,
  cancelBooking,
  rescheduleBooking,
  scanBooking,
};
