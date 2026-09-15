import { useState } from "react";
import api from "../services/api";
import { campusDate, MEALS, errorMessage } from "../services/utils";
import useResource from "../hooks/useResource";
import ResourceState from "../components/ResourceState";
import Pagination from "../components/Pagination";
export default function ManageSlots() {
  const [date, setDate] = useState(campusDate()),
    [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const resource = useResource(
    "/admin/slots?" + new URLSearchParams({ date, page }),
  );
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.post("/admin/slots", {
        ...Object.fromEntries(new FormData(form)),
        date,
      });
      setMessage("Slot created");
      form.reset();
      resource.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function update(slot, values) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.put("/admin/slots/" + slot._id, {
        capacity: slot.capacity,
        active: slot.active,
        ...values,
      });
      setMessage("Slot updated");
      resource.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Daily inventory</p>
          <h1>Meal slots</h1>
          <p className="muted">
            Each day has its own capacity. Times are in India Standard Time.
          </p>
        </div>
        <label>
          Service date
          <input
            type="date"
            required
            value={date}
            onChange={(event) => {
              if (event.target.value) {
                setDate(event.target.value);
                setPage(1);
              }
            }}
          />
        </label>
      </div>
      <form className="card form-grid" onSubmit={submit}>
        <label>
          Meal
          <select name="mealType">
            {MEALS.map((meal) => (
              <option key={meal}>{meal}</option>
            ))}
          </select>
        </label>
        <label>
          Floor
          <select name="floor">
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
          </select>
        </label>
        <label>
          Start
          <input type="time" name="startTime" required />
        </label>
        <label>
          End
          <input type="time" name="endTime" required />
        </label>
        <label>
          Capacity
          <input
            type="number"
            name="capacity"
            min="1"
            max="10000"
            step="1"
            required
          />
        </label>
        <button className="primary" disabled={busy || date < campusDate()}>
          Create slot
        </button>
      </form>
      {message && (
        <p className="notice success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <ResourceState {...resource} empty={!resource.data?.items.length} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Meal</th>
              <th>Floor</th>
              <th>Time</th>
              <th>Reserved</th>
              <th>Capacity</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {resource.data?.items.map((slot) => (
              <tr key={slot._id}>
                <td className="capitalize">{slot.mealType}</td>
                <td>{slot.floor}</td>
                <td>
                  {slot.startTime} – {slot.endTime}
                </td>
                <td>{slot.bookedCount}</td>
                <td>
                  <form
                    className="inline-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      update(slot, {
                        capacity: Number(
                          new FormData(event.currentTarget).get("capacity"),
                        ),
                      });
                    }}
                  >
                    <input
                      aria-label={
                        "Capacity for " +
                        slot.mealType +
                        " " +
                        slot.startTime +
                        " floor " +
                        slot.floor
                      }
                      type="number"
                      min={Math.max(1, slot.bookedCount)}
                      max="10000"
                      name="capacity"
                      defaultValue={slot.capacity}
                      key={slot.capacity}
                      required
                    />
                    <button disabled={busy}>Save</button>
                  </form>
                </td>
                <td>
                  <button
                    disabled={busy || (slot.active && slot.bookedCount > 0)}
                    onClick={() => update(slot, { active: !slot.active })}
                  >
                    {slot.active ? "Close slot" : "Reopen slot"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">
        Reserved slots cannot be closed. Existing bookings retain their original
        time.
      </p>
      <Pagination data={resource.data} page={page} setPage={setPage} />
    </>
  );
}
