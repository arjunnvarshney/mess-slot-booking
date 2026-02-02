const mongoose = require("mongoose");

const mealSlotSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ["breakfast", "lunch", "snacks", "dinner"],
    required: true
  },
  floor: {
    type: Number,
    enum: [1, 2],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  bookedCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("MealSlot", mealSlotSchema);
