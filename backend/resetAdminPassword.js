const mongoose = require("mongoose");
require("dotenv").config();
const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const admin = await Admin.findOne({ username: "admin" });

    if (!admin) {
      console.log("Admin not found");
      process.exit();
    }

    admin.password = "admin123"; // plain password
    await admin.save(); // triggers hashing middleware

    console.log("✅ Admin password reset to: admin123");
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
