require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Student = require("../models/Student");

async function seedDemo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existingDemo = await Student.findOne({ rollNo: "DEMO123" });
    if (existingDemo) {
      console.log("Demo student already exists. Resetting password...");
      existingDemo.password = "password123";
      await existingDemo.save();
      console.log("Password reset for Demo student.");
    } else {
      const demoStudent = new Student({
        rollNo: "DEMO123",
        name: "Demo Student",
        hostel: "Recruiter Hostel",
        floor: 1,
        password: "password123"
      });
      await demoStudent.save();
      console.log("Created DEMO123 student successfully.");
    }
  } catch (error) {
    console.error("Error seeding demo:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedDemo();
