const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hostel: { type: String, required: true },
  floor: { type: Number, default: 1 },
  password: { type: String, required: true }
}, { timestamps: true });

/* 🔐 HASH PASSWORD BEFORE SAVE */
studentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* 🔑 COMPARE PASSWORD METHOD */
studentSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);
