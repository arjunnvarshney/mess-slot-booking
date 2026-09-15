import { useState } from "react";
import { MEALS, bookingStatus, displayDate } from "../services/utils";
import useResource from "../hooks/useResource";
import ResourceState from "../components/ResourceState";
import Pagination from "../components/Pagination";
export default function AdminBookings() {
  const [page, setPage] = useState(1),
    [date, setDate] = useState(""),
    [meal, setMeal] = useState(""),
    [status, setStatus] = useState("");
  const resource = useResource(
    "/admin/bookings?" +
      new URLSearchParams({
        page,
        ...(date && { date }),
        ...(meal && { mealType: meal }),
        ...(status && { status }),
      }),
    30000,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Dining records</p>
          <h1>Bookings</h1>
          <p className="muted">
            Reservations and consumption across the campus.
          </p>
        </div>
        <button onClick={resource.reload}>Refresh</button>
      </div>
      <div className="filters">
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          Meal
          <select
            value={meal}
            onChange={(event) => {
              setMeal(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All meals</option>
            {MEALS.map((meal) => (
              <option key={meal}>{meal}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active / consumed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <ResourceState {...resource} empty={!resource.data?.items.length} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                "Student",
                "Roll no.",
                "Date",
                "Meal",
                "Floor",
                "Time",
                "Status",
              ].map((label) => (
                <th key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resource.data?.items.map((booking) => {
              const student = booking.studentSnapshot?.name
                ? booking.studentSnapshot
                : booking.student;
              return (
                <tr key={booking._id}>
                  <td>{student?.name || "Archived student"}</td>
                  <td>{student?.rollNo || "—"}</td>
                  <td>{displayDate(booking.serviceDate || booking.date)}</td>
                  <td className="capitalize">{booking.mealType}</td>
                  <td>{booking.floor}</td>
                  <td>
                    {booking.slotTime ||
                      (booking.slot
                        ? booking.slot.startTime + " – " + booking.slot.endTime
                        : "—")}
                  </td>
                  <td>{bookingStatus(booking)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination data={resource.data} page={page} setPage={setPage} />
    </>
  );
}
