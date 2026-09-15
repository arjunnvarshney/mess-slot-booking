const mongoose = require("mongoose");
const { MEALS } = require("../lib/domain");
const schema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealSlot",
      required: true,
    },
    mealType: { type: String, enum: MEALS, required: true },
    floor: { type: Number, enum: [1, 2], required: true },
    serviceDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    date: { type: Date, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    slotTime: { type: String, required: true },
    studentSnapshot: { name: String, rollNo: String, hostel: String },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
    qrUsed: { type: Boolean, default: false },
    usedAt: Date,
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    cancelledAt: Date,
    qrCode: { type: String, required: true, select: false },
  },
  { timestamps: true },
);
schema.index({ qrCode: 1 }, { unique: true, sparse: true });
schema.index(
  { student: 1, mealType: 1, serviceDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "active",
      serviceDate: { $type: "string" },
    },
  },
);
schema.index({ serviceDate: 1, status: 1 });
schema.index({ student: 1, createdAt: -1 });
schema.index({ slot: 1 });
module.exports = mongoose.models.Booking || mongoose.model("Booking", schema);
