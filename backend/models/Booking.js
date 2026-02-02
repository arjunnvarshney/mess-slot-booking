const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealSlot",
      required: true
    },

    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true
    },

    floor: {
      type: Number,
      required: true
    },

    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      }
    },

    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active"
    },

    qrUsed: {
      type: Boolean,
      default: false
    },

    // 🔥 UNIQUE QR STRING STORED HERE
    qrCode: {
      type: String,
      unique: true,      // 🚀 prevents duplicate QR
      sparse: true       // allows old records without QR
    }
  },
  { timestamps: true }
);

// 📌 Index for fast QR scanning
bookingSchema.index({ qrCode: 1 });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
