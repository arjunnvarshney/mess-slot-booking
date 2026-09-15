const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { password } = require("../lib/domain");
const schema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 40,
      match: /^[A-Z0-9-]+$/,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    hostel: { type: String, required: true, trim: true, maxlength: 100 },
    floor: { type: Number, required: true, enum: [1, 2] },
    password: { type: String, required: true, select: false },
    active: { type: Boolean, default: true },
    authVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);
schema.pre("save", async function () {
  if (!this.isModified("password")) return;
  password(this.password);
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.authVersion = (this.authVersion || 0) + 1;
});
schema.methods.comparePassword = function (value) {
  return bcrypt.compare(value, this.password);
};
module.exports = mongoose.models.Student || mongoose.model("Student", schema);
