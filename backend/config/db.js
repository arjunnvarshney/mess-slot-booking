const mongoose = require("mongoose");
module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: false,
    serverSelectionTimeoutMS: 10000,
  });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== "isdbgrid")
    throw new Error(
      "MongoDB replica set or Atlas is required for transactional booking",
    );
  // Create additive indexes only; never sync/drop historical indexes or data.
  for (const Model of [
    require("../models/Admin"),
    require("../models/Student"),
    require("../models/MealSlot"),
    require("../models/Booking"),
    require("../models/AuditLog"),
    require("../models/DiningDay"),
  ])
    await Model.createIndexes();
};
