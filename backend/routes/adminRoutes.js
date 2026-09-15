const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Booking = require("../models/Booking");
const adminAuth = require("../middleware/adminAuth");
const rateLimit = require("../middleware/rateLimit");
const { login } = require("../services/authService");
const report = require("../services/reportService");
const {
  check,
  text,
  password,
  date,
  today,
  pagination,
  MEALS,
} = require("../lib/domain");
router.post(
  "/login",
  rateLimit({
    keyFor: (req) =>
      req.ip +
      ":" +
      (typeof req.body.username === "string"
        ? req.body.username.trim().slice(0, 100)
        : "invalid"),
  }),
  async (req, res) =>
    res.json({ token: await login(Admin, "username", req.body, "admin") }),
);
router.use(adminAuth);
router.post("/register", async (req, res) => {
  await Admin.create({
    username: text(req.body.username, "Username"),
    password: password(req.body.password),
  });
  res.status(201).json({ message: "Admin created" });
});
router.get("/me", (req, res) =>
  res.json({ admin: { id: req.admin._id, username: req.admin.username } }),
);
router.put("/password", async (req, res) => {
  const nextPassword = password(req.body.newPassword);
  check(
    typeof req.body.currentPassword === "string" &&
      Buffer.byteLength(req.body.currentPassword) <= 72,
    "Current password is required",
  );
  const admin = await Admin.findById(req.admin._id).select("+password");
  check(
    await bcrypt.compare(req.body.currentPassword, admin.password),
    "Current password is incorrect",
  );
  admin.password = nextPassword;
  await admin.save();
  res.json({ message: "Password changed. Please log in again" });
});
router.get("/analytics/daily", async (req, res) =>
  res.json(await report.daily(date(req.query.date || today()))),
);
router.get("/analytics/weekly", async (req, res) =>
  res.json(await report.weekly(date(req.query.date || today()))),
);
router.get("/stats/today", async (req, res) =>
  res.json(await report.daily(today())),
);
router.get("/bookings", async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = req.query.date ? report.dateFilter(date(req.query.date)) : {};
  if (req.query.mealType) {
    check(MEALS.includes(req.query.mealType), "Invalid meal");
    filter.mealType = req.query.mealType;
  }
  if (req.query.status) {
    check(["active", "cancelled"].includes(req.query.status), "Invalid status");
    filter.status = req.query.status;
  }
  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate("student", "name rollNo hostel")
      .populate("slot", "startTime endTime")
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
});
router.get("/reports", async (req, res, next) => {
  const day = date(req.query.date || today());
  res.set({
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="mess-report-' + day + '.csv"',
    "Cache-Control": "no-store",
  });
  const cursor = Booking.find(report.dateFilter(day))
    .populate("student", "name rollNo hostel")
    .sort({ _id: 1 })
    .lean()
    .cursor();
  try {
    res.write(
      "\uFEFF" +
        [
          "Date",
          "Name",
          "Roll No",
          "Hostel",
          "Floor",
          "Meal",
          "Time",
          "Status",
          "Consumed",
        ]
          .map(report.csvCell)
          .join(",") +
        "\r\n",
    );
    for await (const b of cursor) {
      if (res.destroyed) break;
      const student = b.studentSnapshot?.name
        ? b.studentSnapshot
        : b.student || {};
      const row = [
        b.serviceDate || day,
        student.name,
        student.rollNo,
        student.hostel,
        b.floor,
        b.mealType,
        b.slotTime || "",
        b.status,
        b.qrUsed ? "YES" : "NO",
      ];
      if (!res.write(row.map(report.csvCell).join(",") + "\r\n")) {
        await new Promise((resolve) => {
          const done = () => {
            res.off("drain", done);
            res.off("close", done);
            resolve();
          };
          res.once("drain", done);
          res.once("close", done);
        });
      }
    }
    res.end();
  } catch (error) {
    next(error);
  } finally {
    await cursor.close();
  }
});
module.exports = router;
