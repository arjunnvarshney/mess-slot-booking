const Booking = require("../models/Booking");
const MealSlot = require("../models/MealSlot");
require("./runScript")(async () => {
  const [bookings, slots, unused] = await Promise.all([
    Booking.countDocuments({ serviceDate: { $exists: false } }),
    MealSlot.countDocuments({ date: { $exists: false } }),
    Booking.countDocuments({
      serviceDate: { $exists: false },
      status: "active",
      qrUsed: false,
    }),
  ]);
  console.log(
    JSON.stringify(
      {
        legacyBookings: bookings,
        undatedSlots: slots,
        unusedLegacyPasses: unused,
        note: "Read-only audit. Legacy data remains historical; schedule rollout after outstanding meal windows close.",
      },
      null,
      2,
    ),
  );
});
