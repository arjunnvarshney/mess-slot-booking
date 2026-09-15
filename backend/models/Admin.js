const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { password } = require("../lib/domain");
const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    password: { type: String, required: true, select: false },
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
module.exports = mongoose.models.Admin || mongoose.model("Admin", schema);
