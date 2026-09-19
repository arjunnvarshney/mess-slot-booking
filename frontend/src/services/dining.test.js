import { test } from "node:test";
import assert from "node:assert/strict";
import { menuFor, sampleMenu, weekDates, nextMeal } from "./dining.js";
test("sample menus are explicit and published menus replace them across date boundaries", () => {
  assert.equal(sampleMenu("2026-09-19").sample, true);
  assert.equal(sampleMenu("2026-09-19").meals.length, 4);
  assert.deepEqual(weekDates("2026-12-29"), [
    "2026-12-29",
    "2026-12-30",
    "2026-12-31",
    "2027-01-01",
    "2027-01-02",
    "2027-01-03",
    "2027-01-04",
  ]);
  const saved = { date: "2026-09-19", meals: [] };
  assert.equal(menuFor([saved], saved.date), saved);
  assert.equal(menuFor([saved], "2026-09-20").sample, true);
});
test("next meal ignores consumed, cancelled and expired reservations", () => {
  const active = {
    status: "active",
    startAt: "2026-09-19T12:00:00Z",
    endAt: "2026-09-19T12:15:00Z",
  };
  const next = { ...active, startAt: "2026-09-19T11:00:00Z" };
  assert.equal(
    nextMeal(
      [
        active,
        { ...active, qrUsed: true },
        { ...active, status: "cancelled" },
        { ...active, endAt: "2026-09-19T09:00:00Z" },
        next,
      ],
      new Date("2026-09-19T10:00:00Z"),
    ),
    next,
  );
});
