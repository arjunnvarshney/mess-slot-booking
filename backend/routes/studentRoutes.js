const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const studentAuth = require("../middleware/studentAuth");
const { check, password } = require("../lib/domain");
router.get("/profile", studentAuth, (req, res) => res.json(req.student));
router.put("/password", studentAuth, async (req, res) => {
  const nextPassword = password(req.body.newPassword);
  check(
    typeof req.body.currentPassword === "string" &&
      Buffer.byteLength(req.body.currentPassword) <= 72,
    "Current password is required",
  );
  const student = await Student.findById(req.student._id).select("+password");
  check(
    await bcrypt.compare(req.body.currentPassword, student.password),
    "Current password is incorrect",
    400,
  );
  student.password = nextPassword;
  await student.save();
  res.json({ message: "Password changed. Please log in again" });
});
module.exports = router;
