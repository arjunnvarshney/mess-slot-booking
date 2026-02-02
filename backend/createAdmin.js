const mongoose = require("mongoose");
require("dotenv").config();

const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    await Admin.deleteMany({ username: process.env.ADMIN_USERNAME });

    await Admin.create({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD
    });

    console.log("✅ Admin created securely");
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
