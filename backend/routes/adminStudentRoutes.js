const router = require("express").Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Booking = require("../models/Booking");
const AuditLog = require("../models/AuditLog");
const adminAuth = require("../middleware/adminAuth");
const { check, text, password, id, pagination } = require("../lib/domain");
router.use(adminAuth);
function studentInput(body) {
  const rollNo = text(body.rollNo, "Roll number", 40).toUpperCase();
  check(
    /^[A-Z0-9-]+$/.test(rollNo),
    "Roll number must contain letters, numbers, or hyphens",
  );
  const floor = Number(body.floor);
  check([1, 2].includes(floor), "Floor must be 1 or 2");
  return {
    rollNo,
    name: text(body.name, "Name"),
    hostel: text(body.hostel, "Hostel"),
    floor,
    password: password(body.password),
  };
}
router.get("/students", async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = {};
  if (req.query.search) {
    const search = text(req.query.search, "Search").replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    filter.$or = [
      { rollNo: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];
  }
  const [items, total] = await Promise.all([
    Student.find(filter).sort({ rollNo: 1 }).skip(skip).limit(limit).lean(),
    Student.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
});
router.post("/students", async (req, res) => {
  const input = studentInput(req.body);
  await mongoose.connection.transaction(async (session) => {
    const [student] = await Student.create([input], { session });
    await AuditLog.create(
      [
        {
          actor: req.admin._id,
          action: "student.create",
          target: String(student._id),
        },
      ],
      { session },
    );
  });
  res.status(201).json({ message: "Student enrolled" });
});
router.post("/students/import", async (req, res) => {
  check(
    Array.isArray(req.body.students) &&
      req.body.students.length > 0 &&
      req.body.students.length <= 100,
    "Import between 1 and 100 students",
  );
  const inputs = req.body.students.map(studentInput);
  check(
    new Set(inputs.map((s) => s.rollNo)).size === inputs.length,
    "Duplicate roll numbers in import",
  );
  await mongoose.connection.transaction(async (session) => {
    // save hooks hash passwords; insertMany would bypass those hooks.
    for (const input of inputs) await Student.create([input], { session });
    await AuditLog.create(
      [
        {
          actor: req.admin._id,
          action: "student.import",
          details: { count: inputs.length },
        },
      ],
      { session },
    );
  });
  res.status(201).json({ message: inputs.length + " students enrolled" });
});
router.put("/students/:id/floor", async (req, res) => {
  const studentId = id(req.params.id),
    floor = Number(req.body.floor);
  check([1, 2].includes(floor), "Floor must be 1 or 2");
  await mongoose.connection.transaction(async (session) => {
    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: { floor }, $inc: { __v: 1 } },
      { returnDocument: "after", session },
    );
    check(student, "Student not found", 404);
    check(
      !(await Booking.exists({
        student: studentId,
        status: "active",
        qrUsed: false,
        endAt: { $gt: new Date() },
      }).session(session)),
      "Cancel upcoming bookings before changing floor",
      409,
    );
    await AuditLog.create(
      [
        {
          actor: req.admin._id,
          action: "student.floor",
          target: studentId,
          details: { floor },
        },
      ],
      { session },
    );
  });
  res.json({ message: "Floor updated" });
});
router.put("/students/:id/active", async (req, res) => {
  const studentId = id(req.params.id);
  check(typeof req.body.active === "boolean", "Active must be true or false");
  await mongoose.connection.transaction(async (session) => {
    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: { active: req.body.active }, $inc: { authVersion: 1, __v: 1 } },
      { session },
    );
    check(student, "Student not found", 404);
    check(
      req.body.active ||
        !(await Booking.exists({
          student: studentId,
          status: "active",
          qrUsed: false,
          endAt: { $gt: new Date() },
        }).session(session)),
      "Cancel upcoming bookings before deactivating the student",
      409,
    );
    await AuditLog.create(
      [
        {
          actor: req.admin._id,
          action: "student.active",
          target: studentId,
          details: { active: req.body.active },
        },
      ],
      { session },
    );
  });
  res.json({ message: "Student access updated" });
});
router.put("/students/:id/password", async (req, res) => {
  const student = await Student.findById(id(req.params.id)).select("+password");
  check(student, "Student not found", 404);
  student.password = password(req.body.password);
  await mongoose.connection.transaction(async (session) => {
    await student.save({ session });
    await AuditLog.create(
      [
        {
          actor: req.admin._id,
          action: "student.password-reset",
          target: String(student._id),
        },
      ],
      { session },
    );
  });
  res.json({ message: "Password reset; existing sessions revoked" });
});
module.exports = router;
