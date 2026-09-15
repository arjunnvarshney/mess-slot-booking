const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  today,
  instant,
  addDays,
  date,
  isBookable,
  password,
  slotInput,
} = require("../lib/domain");
const { csvCell } = require("../services/reportService");
const MealSlot = require("../models/MealSlot");
test("campus day switches at India midnight regardless of host timezone", () => {
  assert.equal(today(new Date("2026-09-12T18:29:59Z")), "2026-09-12");
  assert.equal(today(new Date("2026-09-12T18:30:00Z")), "2026-09-13");
  assert.equal(
    instant("2026-09-13", "07:30").toISOString(),
    "2026-09-13T02:00:00.000Z",
  );
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});
test("invalid dates, times and passwords are rejected", () => {
  for (const value of ["2026-02-30", "bad", {}, "2026-2-03"])
    assert.throws(() => date(value));
  assert.throws(() => instant("2026-09-13", "25:00"));
  assert.throws(() => password("short"));
  assert.throws(() => password("😀".repeat(20)));
  assert.equal(password("a-long-test-password"), "a-long-test-password");
});
test("cutoff is exclusive and capacity and day are enforced", () => {
  const slot = {
    date: "2026-09-13",
    startTime: "08:00",
    capacity: 2,
    bookedCount: 1,
    active: true,
  };
  assert.equal(isBookable(slot, instant(slot.date, "07:44")), true);
  assert.equal(isBookable(slot, instant(slot.date, "07:45")), false);
  assert.equal(
    isBookable({ ...slot, bookedCount: 2 }, instant(slot.date, "07:00")),
    false,
  );
  assert.equal(
    isBookable({ ...slot, active: false }, instant(slot.date, "07:00")),
    false,
  );
  assert.equal(isBookable(slot, instant("2026-09-14", "07:00")), false);
});
test("schema preserves slot dates and rejects invalid capacity/order", async () => {
  const values = {
    mealType: "snacks",
    floor: 1,
    date: "2026-09-13",
    startTime: "17:00",
    endTime: "17:15",
    capacity: 10,
  };
  await new MealSlot(values).validate();
  assert.equal(new MealSlot(values).date, values.date);
  for (const change of [
    { capacity: -1 },
    { capacity: 1.5 },
    { endTime: "16:00" },
    { startTime: "99:99" },
    { date: "2026-02-30" },
  ])
    await assert.rejects(new MealSlot({ ...values, ...change }).validate());
});
test("request slot validation rejects invalid enums and capacity", () => {
  const input = {
    mealType: "lunch",
    floor: 1,
    date: today(),
    startTime: "12:00",
    endTime: "13:00",
    capacity: 10,
  };
  assert.equal(slotInput(input).capacity, 10);
  for (const change of [
    { floor: 3 },
    { mealType: {} },
    { capacity: "" },
    { capacity: 1.2 },
    { endTime: "11:00" },
  ])
    assert.throws(() => slotInput({ ...input, ...change }));
});
test("CSV quotes delimiters, multiline data and formula prefixes", () => {
  assert.equal(csvCell('A, "B"\nC'), '"A, ""B""\nC"');
  assert.equal(csvCell("=1+1"), '"' + "'=1+1" + '"');
  assert.equal(csvCell("  @SUM(A1)"), '"' + "'  @SUM(A1)" + '"');
  assert.equal(csvCell(null), '""');
});

test("login throttling does not block another student on the same campus IP", () => {
  const rateLimit = require("../middleware/rateLimit");
  const limiter = rateLimit({
    limit: 2,
    keyFor: (req) => req.ip + ":" + req.body.rollNo,
  });
  let allowed = 0,
    blocked = 0;
  const response = {
    set() {},
    status(code) {
      assert.equal(code, 429);
      return this;
    },
    json() {
      blocked++;
    },
  };
  const call = (rollNo) =>
    limiter({ ip: "campus-nat", body: { rollNo } }, response, () => allowed++);
  call("ONE");
  call("ONE");
  call("ONE");
  call("TWO");
  assert.equal(allowed, 3);
  assert.equal(blocked, 1);
});
