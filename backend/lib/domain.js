const MEALS = ["breakfast", "lunch", "snacks", "dinner"];
const CUTOFF_MINUTES = 15;
const TIME_ZONE = "Asia/Kolkata";
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
function check(condition, message, status = 400) {
  if (!condition) throw new HttpError(status, message);
}
function text(value, name, max = 100) {
  check(
    typeof value === "string" &&
      value.trim().length > 0 &&
      value.trim().length <= max,
    name + " is required (maximum " + max + " characters)",
  );
  return value.trim();
}
function password(value) {
  check(
    typeof value === "string" &&
      value.length >= 12 &&
      Buffer.byteLength(value) <= 72,
    "Password must be at least 12 characters and at most 72 bytes",
  );
  return value;
}
function date(value) {
  check(
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Date must be YYYY-MM-DD",
  );
  const parsed = new Date(value + "T00:00:00Z");
  check(
    Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value,
    "Invalid date",
  );
  return value;
}
function today(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type).value;
  return get("year") + "-" + get("month") + "-" + get("day");
}
function instant(day, time = "00:00") {
  date(day);
  check(
    typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time),
    "Time must be HH:MM",
  );
  // India uses UTC+05:30 year-round.
  return new Date(day + "T" + time + ":00+05:30");
}
function addDays(day, count) {
  const d = new Date(date(day) + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}
function isBookable(slot, now = new Date()) {
  return (
    slot.date === today(now) &&
    slot.active !== false &&
    slot.bookedCount < slot.capacity &&
    now.getTime() <
      instant(slot.date, slot.startTime).getTime() - CUTOFF_MINUTES * 60000
  );
}
function slotInput(body) {
  const value = {
    mealType: body.mealType,
    floor: Number(body.floor),
    date: date(body.date),
    startTime: body.startTime,
    endTime: body.endTime,
    capacity: Number(body.capacity),
  };
  check(MEALS.includes(value.mealType), "Invalid meal type");
  check([1, 2].includes(value.floor), "Floor must be 1 or 2");
  check(
    Number.isInteger(value.capacity) &&
      value.capacity > 0 &&
      value.capacity <= 10000,
    "Capacity must be an integer between 1 and 10000",
  );
  check(
    instant(value.date, value.startTime) < instant(value.date, value.endTime),
    "End time must be after start time",
  );
  check(value.date >= today(), "Cannot create slots in the past");
  return value;
}
function id(value) {
  check(
    typeof value === "string" && /^[a-f\d]{24}$/i.test(value),
    "Invalid ID",
  );
  return value;
}
function pagination(query) {
  const page = Number(query.page ?? 1),
    limit = Number(query.limit ?? 25);
  check(
    Number.isInteger(page) &&
      page > 0 &&
      page <= 100000 &&
      Number.isInteger(limit) &&
      limit > 0 &&
      limit <= 100,
    "Invalid pagination",
  );
  return { page, limit, skip: (page - 1) * limit };
}
module.exports = {
  MEALS,
  CUTOFF_MINUTES,
  TIME_ZONE,
  HttpError,
  check,
  text,
  password,
  date,
  today,
  instant,
  addDays,
  isBookable,
  slotInput,
  id,
  pagination,
};
