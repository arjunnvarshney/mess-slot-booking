const mongoose = require("mongoose");
const { MEALS, date } = require("../lib/domain");
const schema = new mongoose.Schema(
  {
    mealType: { type: String, enum: MEALS, required: true },
    floor: { type: Number, enum: [1, 2], required: true },
    date: {
      type: String,
      required: true,
      validate: (value) => {
        try {
          date(value);
          return true;
        } catch {
          return false;
        }
      },
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
      validate: Number.isInteger,
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
schema.pre("validate", function () {
  if (this.startTime >= this.endTime)
    this.invalidate("endTime", "End time must be after start time");
  if (this.bookedCount > this.capacity)
    this.invalidate("bookedCount", "Capacity exceeded");
});
schema.index(
  { date: 1, floor: 1, mealType: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { date: { $type: "string" } } },
);
module.exports = mongoose.models.MealSlot || mongoose.model("MealSlot", schema);
