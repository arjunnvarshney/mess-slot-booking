const MealSlot = require("../models/MealSlot");
const { today, date, addDays, check } = require("../lib/domain");
const toMinutes = (value) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};
const toTime = (value) =>
  String(Math.floor(value / 60)).padStart(2, "0") +
  ":" +
  String(value % 60).padStart(2, "0");
require("./runScript")(async () => {
  const firstDay = date(process.argv[2] || today());
  const days = Number(process.argv[3] || 7);
  check(
    firstDay >= today() && Number.isInteger(days) && days >= 1 && days <= 31,
    "Use a current/future date and between 1 and 31 days",
  );
  let created = 0;
  for (let day = 0; day < days; day++) {
    for (const [mealType, start, end] of [
      ["breakfast", "07:30", "09:30"],
      ["lunch", "12:00", "15:00"],
      ["snacks", "17:00", "18:00"],
      ["dinner", "20:00", "22:00"],
    ]) {
      for (const floor of [1, 2]) {
        for (
          let minute = toMinutes(start);
          minute < toMinutes(end);
          minute += 15
        ) {
          const key = {
            date: addDays(firstDay, day),
            mealType,
            floor,
            startTime: toTime(minute),
          };
          const result = await MealSlot.updateOne(
            key,
            {
              $setOnInsert: {
                ...key,
                endTime: toTime(minute + 15),
                capacity: 120,
                bookedCount: 0,
                active: true,
              },
            },
            { upsert: true, runValidators: true },
          );
          created += result.upsertedCount;
        }
      }
    }
  }
  console.log(
    created +
      " daily slots created; existing capacities and bookings preserved",
  );
});
