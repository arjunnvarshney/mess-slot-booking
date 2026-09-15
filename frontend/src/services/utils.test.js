import { test } from "node:test";
import assert from "node:assert/strict";
import { campusDate, bookingStatus, canChange } from "./utils.js";
test("campus date uses India midnight", () => {
  assert.equal(campusDate(new Date("2026-09-12T18:30:00Z")), "2026-09-13");
});
test("booking status distinguishes cancelled, consumed, archived and expired", () => {
  const booking = {
    status: "active",
    qrUsed: false,
    serviceDate: "2026-09-13",
    startAt: "2026-09-13T02:30:00Z",
    endAt: "2026-09-13T03:00:00Z",
  };
  assert.equal(
    bookingStatus(booking, new Date("2026-09-13T02:00:00Z")),
    "Active",
  );
  assert.equal(
    bookingStatus(booking, new Date("2026-09-13T03:00:00Z")),
    "Expired",
  );
  assert.equal(bookingStatus({ ...booking, qrUsed: true }), "Consumed");
  assert.equal(bookingStatus({ ...booking, status: "cancelled" }), "Cancelled");
  assert.equal(bookingStatus({ status: "active" }), "Archived");
  assert.equal(canChange(booking, new Date("2026-09-13T02:14:59Z")), true);
  assert.equal(canChange(booking, new Date("2026-09-13T02:15:00Z")), false);
});
