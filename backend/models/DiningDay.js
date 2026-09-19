const mongoose = require("mongoose");
const mealSchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "snacks", "dinner"],
      required: true,
    },
    dishes: [{ type: String, maxlength: 80 }],
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    meals: [mealSchema],
    announcement: { type: String, default: "", maxlength: 500 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);
module.exports = mongoose.model("DiningDay", schema);
