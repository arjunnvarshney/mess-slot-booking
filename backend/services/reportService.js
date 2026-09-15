const Booking = require("../models/Booking");
const { MEALS, TIME_ZONE, instant, addDays } = require("../lib/domain");
function dateFilter(day) {
  return {
    $or: [
      { serviceDate: day },
      {
        serviceDate: { $exists: false },
        date: { $gte: instant(day), $lt: instant(addDays(day, 1)) },
      },
    ],
  };
}
async function daily(day) {
  const rows = await Booking.aggregate([
    { $match: { ...dateFilter(day), status: "active" } },
    {
      $group: {
        _id: "$mealType",
        totalBookings: { $sum: 1 },
        totalConsumed: { $sum: { $cond: ["$qrUsed", 1, 0] } },
        students: { $addToSet: "$student" },
      },
    },
  ]);
  return {
    meals: MEALS.map((meal) => {
      const row = rows.find((r) => r._id === meal);
      return {
        _id: meal,
        totalBookings: row?.totalBookings || 0,
        totalConsumed: row?.totalConsumed || 0,
      };
    }),
    totalStudents: new Set(rows.flatMap((r) => r.students.map(String))).size,
  };
}
async function weekly(day) {
  const start = addDays(day, -6);
  const rows = await Booking.aggregate([
    {
      $match: {
        status: "active",
        $or: [
          { serviceDate: { $gte: start, $lte: day } },
          {
            serviceDate: { $exists: false },
            date: { $gte: instant(start), $lt: instant(addDays(day, 1)) },
          },
        ],
      },
    },
    {
      $group: {
        _id: {
          $ifNull: [
            "$serviceDate",
            {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date",
                timezone: TIME_ZONE,
              },
            },
          ],
        },
        totalBookings: { $sum: 1 },
        totalConsumed: { $sum: { $cond: ["$qrUsed", 1, 0] } },
      },
    },
  ]);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return (
      rows.find((row) => row._id === date) || {
        _id: date,
        totalBookings: 0,
        totalConsumed: 0,
      }
    );
  });
}
function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
module.exports = { dateFilter, daily, weekly, csvCell };
