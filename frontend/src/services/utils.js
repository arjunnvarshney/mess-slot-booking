export const MEALS = ["breakfast", "lunch", "snacks", "dinner"];
export function campusDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type).value;
  return get("year") + "-" + get("month") + "-" + get("day");
}
export function errorMessage(error) {
  return error.response?.data?.error || "Unable to connect. Please retry.";
}
export function bookingStatus(booking, now = new Date()) {
  if (booking.status === "cancelled") return "Cancelled";
  if (booking.qrUsed) return "Consumed";
  if (!booking.serviceDate || !booking.endAt) return "Archived";
  if (new Date(booking.endAt) <= now) return "Expired";
  return "Active";
}
export function canChange(booking, now = new Date()) {
  return (
    bookingStatus(booking, now) === "Active" &&
    new Date(booking.startAt).getTime() - now.getTime() > 15 * 60000
  );
}
export function displayDate(value) {
  if (!value) return "Legacy record";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value.length === 10 ? value + "T12:00:00+05:30" : value));
}
