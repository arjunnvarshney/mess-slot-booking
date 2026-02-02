const mongoose = require("mongoose");
require("dotenv").config();

const MealSlot = require("../models/MealSlot");

const SLOT_DURATION = 15; // minutes
const CAPACITY = 120;
const FLOORS = [1, 2];

const MEALS = [
  {
    mealType: "breakfast",
    start: "07:30",
    end: "09:30"
  },
  {
    mealType: "lunch",
    start: "12:00",
    end: "15:00"
  },
  {
    mealType: "snacks",
    start: "17:00",
    end: "18:00"
  },
  {
    mealType: "dinner",
    start: "20:00",
    end: "22:00"
  }
];

// Convert HH:MM → minutes
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Convert minutes → HH:MM
const toTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const createSlots = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  for (const meal of MEALS) {
    const startMin = toMinutes(meal.start);
    const endMin = toMinutes(meal.end);

    for (const floor of FLOORS) {
      for (let t = startMin; t < endMin; t += SLOT_DURATION) {
        const slot = {
          mealType: meal.mealType,
          floor,
          startTime: toTime(t),
          endTime: toTime(t + SLOT_DURATION),
          capacity: CAPACITY,
          bookedCount: 0
        };

        await MealSlot.create(slot);
        console.log(
          `Created ${meal.mealType} | Floor ${floor} | ${slot.startTime}-${slot.endTime}`
        );
      }
    }
  }

  console.log("✅ ALL MEAL SLOTS CREATED");
  process.exit();
};

createSlots().catch((err) => {
  console.error(err);
  process.exit(1);
});
