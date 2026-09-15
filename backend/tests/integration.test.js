const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const MealSlot = require("../models/MealSlot");
const Booking = require("../models/Booking");
const AuditLog = require("../models/AuditLog");
const { instant, today } = require("../lib/domain");
const service = require("../services/bookingService");
const reports = require("../services/reportService");
let repl, server, base, admin, student, adminToken, studentToken;
const secret = "isolated-test-secret-never-for-production";
const credential = "correct-horse-test-password";
const now = instant("2026-09-13", "06:00");
function token(user, role) {
  return jwt.sign({ role, version: user.authVersion || 0 }, secret, {
    subject: String(user._id),
    expiresIn: "1h",
  });
}
async function request(url, { method = "GET", body, auth } = {}) {
  const response = await fetch(base + url, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(auth && { Authorization: "Bearer " + auth }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.headers
    .get("content-type")
    ?.includes("application/json")
    ? await response.json()
    : await response.text();
  return { status: response.status, data };
}
async function slot(values = {}) {
  return MealSlot.create({
    date: "2026-09-13",
    mealType: "breakfast",
    floor: 1,
    startTime: "08:00",
    endTime: "08:15",
    capacity: 1,
    ...values,
  });
}
before(async () => {
  process.env.JWT_SECRET = secret;
  repl = await MongoMemoryReplSet.create({
    binary: {
      downloadDir: path.join(
        __dirname,
        "../node_modules/.cache/mongodb-binaries",
      ),
    },
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(repl.getUri("mess_booking_tests"), {
    autoIndex: false,
  });
  for (const Model of [Admin, Student, MealSlot, Booking, AuditLog])
    await Model.createIndexes();
  server = require("../app")().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port + "/api";
});
beforeEach(async () => {
  for (const Model of [Booking, MealSlot, Student, Admin, AuditLog])
    await Model.deleteMany({});
  admin = await Admin.create({ username: "operator", password: credential });
  student = await Student.create({
    rollNo: "TEST1",
    name: "Test Student",
    hostel: "A",
    floor: 1,
    password: credential,
  });
  adminToken = token(admin, "admin");
  studentToken = token(student, "student");
});
after(async () => {
  if (server)
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
  await mongoose.disconnect();
  if (repl) await repl.stop();
});
test("admin creation and scan require admin authentication; public enrollment is gone", async () => {
  assert.equal(
    (await request("/admin/register", { method: "POST", body: {} })).status,
    401,
  );
  assert.equal(
    (await request("/bookings/scan", { method: "POST", body: {} })).status,
    401,
  );
  assert.equal(
    (
      await request("/bookings/scan", {
        method: "POST",
        body: {},
        auth: studentToken,
      })
    ).status,
    401,
  );
  assert.equal(
    (await request("/students/create", { method: "POST", body: {} })).status,
    404,
  );
  assert.equal(
    (
      await request("/bookings/scan", {
        method: "POST",
        body: { qrCode: { $ne: null } },
        auth: adminToken,
      })
    ).status,
    400,
  );
});
test("admin registration hashes once; malformed login input is rejected", async () => {
  assert.equal(
    (
      await request("/admin/register", {
        method: "POST",
        auth: adminToken,
        body: { username: "newadmin", password: credential },
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await request("/admin/login", {
        method: "POST",
        body: { username: "newadmin", password: credential },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/admin/login", {
        method: "POST",
        body: { username: { $ne: null }, password: credential },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/bookings/create", {
        method: "POST",
        auth: studentToken,
        body: {},
      })
    ).status,
    400,
  );
});
test("only one student can reserve the last seat concurrently", async () => {
  const target = await slot();
  const other = await Student.create({
    rollNo: "TEST2",
    name: "Other",
    hostel: "A",
    floor: 1,
    password: credential,
  });
  const results = await Promise.allSettled([
    service.createBooking(student, "breakfast", undefined, now),
    service.createBooking(other, "breakfast", undefined, now),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(await Booking.countDocuments(), 1);
  assert.equal((await MealSlot.findById(target._id)).bookedCount, 1);
});
test("concurrent requests from one student produce one booking and one counter increment", async () => {
  const target = await slot({ capacity: 10 });
  const results = await Promise.allSettled(
    Array.from({ length: 4 }, () =>
      service.createBooking(student, "breakfast", undefined, now),
    ),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(await Booking.countDocuments(), 1);
  assert.equal((await MealSlot.findById(target._id)).bookedCount, 1);
});
test("the same meal can be booked on successive days with independent capacity", async () => {
  const first = await slot();
  const second = await slot({ date: "2026-09-14" });
  await service.createBooking(student, "breakfast", undefined, now);
  await service.createBooking(
    student,
    "breakfast",
    undefined,
    instant("2026-09-14", "06:00"),
  );
  assert.equal(await Booking.countDocuments(), 2);
  assert.equal((await MealSlot.findById(first._id)).bookedCount, 1);
  assert.equal((await MealSlot.findById(second._id)).bookedCount, 1);
});
test("closed earlier slots are skipped in favor of later bookable slots", async () => {
  await slot({ startTime: "06:00", endTime: "06:15" });
  const later = await slot();
  const booking = await service.createBooking(
    student,
    "breakfast",
    undefined,
    now,
  );
  assert.equal(String(booking.slot), String(later._id));
});
test("snacks are supported and invalid meals leave counters unchanged", async () => {
  const target = await slot({
    mealType: "snacks",
    startTime: "17:00",
    endTime: "17:15",
  });
  await assert.rejects(
    service.createBooking(student, "invalid", undefined, now),
  );
  assert.equal((await MealSlot.findById(target._id)).bookedCount, 0);
  await service.createBooking(student, "snacks", undefined, now);
  assert.equal((await MealSlot.findById(target._id)).bookedCount, 1);
});
test("a booking persistence failure rolls back the slot increment", async () => {
  const target = await slot();
  const original = Booking.create;
  Booking.create = async () => {
    throw new Error("Injected persistence failure");
  };
  try {
    await assert.rejects(
      service.createBooking(student, "breakfast", undefined, now),
      /Injected/,
    );
  } finally {
    Booking.create = original;
  }
  assert.equal((await MealSlot.findById(target._id)).bookedCount, 0);
  assert.equal(await Booking.countDocuments(), 0);
});
test("concurrent scan calls redeem once and respect the exact meal window", async () => {
  await slot();
  const booking = await service.createBooking(
    student,
    "breakfast",
    undefined,
    now,
  );
  const stored = await Booking.findById(booking._id).select("+qrCode");
  await assert.rejects(
    service.scanBooking(
      stored.qrCode,
      admin._id,
      instant("2026-09-13", "07:59"),
    ),
  );
  await assert.rejects(
    service.scanBooking(
      stored.qrCode,
      admin._id,
      instant("2026-09-13", "08:15"),
    ),
  );
  const results = await Promise.allSettled([
    service.scanBooking(
      stored.qrCode,
      admin._id,
      instant("2026-09-13", "08:00"),
    ),
    service.scanBooking(
      stored.qrCode,
      admin._id,
      instant("2026-09-13", "08:00"),
    ),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(
    String((await Booking.findById(booking._id)).scannedBy),
    String(admin._id),
  );
});
test("cancellation releases capacity exactly once and invalidates the old pass", async () => {
  const target = await slot();
  const booking = await service.createBooking(
    student,
    "breakfast",
    undefined,
    now,
  );
  const stored = await Booking.findById(booking._id).select("+qrCode");
  await service.cancelBooking(student._id, String(booking._id), now);
  await assert.rejects(
    service.cancelBooking(student._id, String(booking._id), now),
  );
  assert.equal((await MealSlot.findById(target._id)).bookedCount, 0);
  await assert.rejects(
    service.scanBooking(
      stored.qrCode,
      admin._id,
      instant("2026-09-13", "08:00"),
    ),
  );
  await service.createBooking(student, "breakfast", undefined, now);
  assert.equal((await MealSlot.findById(target._id)).bookedCount, 1);
});
test("failed rescheduling restores the original booking and capacity", async () => {
  const original = await slot();
  const full = await slot({
    startTime: "08:15",
    endTime: "08:30",
    bookedCount: 1,
  });
  const booking = await service.createBooking(
    student,
    "breakfast",
    String(original._id),
    now,
  );
  await assert.rejects(
    service.rescheduleBooking(
      student,
      String(booking._id),
      String(full._id),
      now,
    ),
  );
  assert.equal((await Booking.findById(booking._id)).status, "active");
  assert.equal((await MealSlot.findById(original._id)).bookedCount, 1);
  const available = await slot({ startTime: "08:30", endTime: "08:45" });
  const moved = await service.rescheduleBooking(
    student,
    String(booking._id),
    String(available._id),
    now,
  );
  assert.equal((await Booking.findById(booking._id)).status, "cancelled");
  assert.equal(String(moved.slot), String(available._id));
  assert.equal((await MealSlot.findById(original._id)).bookedCount, 0);
});
test("history is owned and QR recovery is repeatable without exposing tokens in lists", async () => {
  const day = today();
  const target = await slot({
    date: day,
    startTime: "23:30",
    endTime: "23:59",
  });
  const booking = await service.createBooking(
    student,
    "breakfast",
    String(target._id),
    instant(day, "06:00"),
  );
  // Recovery is tested with a future end instant so it is independent of wall-clock execution time.
  await Booking.updateOne(
    { _id: booking._id },
    { $set: { endAt: new Date(Date.now() + 3600000) } },
  );
  const history = await request("/bookings/my", { auth: studentToken });
  assert.equal(history.status, 200);
  assert.equal(history.data.items.length, 1);
  assert.equal(history.data.items[0].qrCode, undefined);
  const pass = await request("/bookings/" + booking._id + "/qr", {
    auth: studentToken,
  });
  assert.equal(pass.status, 200);
  assert.match(pass.data.qrCode, /^data:image\/png;base64,/);
  assert.equal(
    (await request("/bookings/" + booking._id + "/qr", { auth: studentToken }))
      .data.qrCode,
    pass.data.qrCode,
  );
  const other = await Student.create({
    rollNo: "TEST2",
    name: "Other",
    hostel: "A",
    floor: 1,
    password: credential,
  });
  assert.equal(
    (
      await request("/bookings/" + booking._id + "/qr", {
        auth: token(other, "student"),
      })
    ).status,
    404,
  );
});
test("date reports preserve booking floor and snapshot; weekly reports include zero days", async () => {
  await slot();
  await service.createBooking(student, "breakfast", undefined, now);
  await Student.updateOne(
    { _id: student._id },
    { $set: { floor: 2, name: "Changed name" } },
  );
  const report = await request("/admin/reports?date=2026-09-13", {
    auth: adminToken,
  });
  assert.equal(report.status, 200);
  assert.match(report.data, /"Test Student"/);
  assert.match(report.data, /"1","breakfast"/);
  const empty = await request("/admin/reports?date=2026-09-14", {
    auth: adminToken,
  });
  assert.doesNotMatch(empty.data, /Test Student/);
  const weekly = await reports.weekly("2026-09-13");
  assert.equal(weekly.length, 7);
  assert.equal(weekly[6].totalBookings, 1);
  assert.equal(weekly[0].totalBookings, 0);
  const day = await reports.daily("2026-09-13");
  assert.equal(day.totalStudents, 1);
  assert.equal(day.meals.length, 4);
});
test("password reset invalidates old sessions and inactive students cannot log in", async () => {
  const reset = await request("/admin/students/" + student._id + "/password", {
    method: "PUT",
    auth: adminToken,
    body: { password: "new-correct-test-password" },
  });
  assert.equal(reset.status, 200);
  assert.equal(
    (await request("/students/profile", { auth: studentToken })).status,
    401,
  );
  assert.equal(
    (
      await request("/students/auth/login", {
        method: "POST",
        body: { rollNo: "test1", password: "new-correct-test-password" },
      })
    ).status,
    200,
  );
  await request("/admin/students/" + student._id + "/active", {
    method: "PUT",
    auth: adminToken,
    body: { active: false },
  });
  assert.equal(
    (
      await request("/students/auth/login", {
        method: "POST",
        body: { rollNo: "TEST1", password: "new-correct-test-password" },
      })
    ).status,
    401,
  );
});
test("student import is all-or-nothing and hashes imported passwords", async () => {
  const inputs = [
    {
      rollNo: "IMPORT1",
      name: "One",
      hostel: "A",
      floor: 1,
      password: credential,
    },
    {
      rollNo: "TEST1",
      name: "Duplicate",
      hostel: "A",
      floor: 1,
      password: credential,
    },
  ];
  assert.equal(
    (
      await request("/admin/students/import", {
        method: "POST",
        auth: adminToken,
        body: { students: inputs },
      })
    ).status,
    409,
  );
  assert.equal(await Student.countDocuments({ rollNo: "IMPORT1" }), 0);
  assert.equal(
    (
      await request("/admin/students/import", {
        method: "POST",
        auth: adminToken,
        body: { students: inputs.slice(0, 1) },
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await request("/students/auth/login", {
        method: "POST",
        body: { rollNo: "IMPORT1", password: credential },
      })
    ).status,
    200,
  );
});

test("floor changes and deactivation cannot invalidate an upcoming pass", async () => {
  const target = await slot({ date: "2099-01-01" });
  await service.createBooking(
    student,
    "breakfast",
    String(target._id),
    instant("2099-01-01", "06:00"),
  );
  const floor = await request("/admin/students/" + student._id + "/floor", {
    method: "PUT",
    auth: adminToken,
    body: { floor: 2 },
  });
  assert.equal(floor.status, 409);
  assert.equal((await Student.findById(student._id)).floor, 1);
  const active = await request("/admin/students/" + student._id + "/active", {
    method: "PUT",
    auth: adminToken,
    body: { active: false },
  });
  assert.equal(active.status, 409);
  assert.equal((await Student.findById(student._id)).active, true);
});
test("reserved slots cannot be closed or reduced below reservations", async () => {
  const target = await slot({ capacity: 5, bookedCount: 3 });
  for (const body of [
    { capacity: 2, active: true },
    { capacity: 5, active: false },
  ]) {
    assert.equal(
      (
        await request("/admin/slots/" + target._id, {
          method: "PUT",
          auth: adminToken,
          body,
        })
      ).status,
      409,
    );
  }
  assert.equal((await MealSlot.findById(target._id)).capacity, 5);
  assert.equal(
    (
      await request("/admin/slots/" + target._id, {
        method: "PUT",
        auth: adminToken,
        body: { capacity: 6, active: true },
      })
    ).status,
    200,
  );
  assert.equal((await MealSlot.findById(target._id)).capacity, 6);
});
test("today bookings are bounded to the owner and hide QR tokens", async () => {
  await slot({ date: today() });
  await service.createBooking(
    student,
    "breakfast",
    undefined,
    instant(today(), "06:00"),
  );
  const response = await request("/bookings/today", { auth: studentToken });
  assert.equal(response.status, 200);
  assert.equal(response.data.length, 1);
  assert.equal(response.data[0].qrCode, undefined);
  const other = await Student.create({
    rollNo: "TEST2",
    name: "Other",
    hostel: "A",
    floor: 1,
    password: credential,
  });
  assert.equal(
    (await request("/bookings/today", { auth: token(other, "student") })).data
      .length,
    0,
  );
});
