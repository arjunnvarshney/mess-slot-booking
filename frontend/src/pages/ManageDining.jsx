import { useState } from "react";
import useResource from "../hooks/useResource";
import ResourceState from "../components/ResourceState";
import api from "../services/api";
import { campusDate, MEALS, errorMessage } from "../services/utils";
import { sampleMenu } from "../services/dining";
function Editor({ day, date }) {
  const [published, setPublished] = useState(Boolean(day));
  const [meals, setMeals] = useState(() =>
    Object.fromEntries(
      (day?.meals || MEALS.map((mealType) => ({ mealType, dishes: [] }))).map(
        (meal) => [meal.mealType, meal.dishes.join("\n")],
      ),
    ),
  );
  const [announcement, setAnnouncement] = useState(day?.announcement || "");
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.put("/admin/dining/" + date, {
        meals: MEALS.map((mealType) => ({
          mealType,
          dishes: meals[mealType]
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        })),
        announcement,
      });
      setMessage("Published. Students can now see this menu and announcement.");
      setPublished(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="stack">
      <p className="notice">
        {published
          ? "Editing a published menu."
          : "No menu published for this date. Students see a labelled sample menu."}{" "}
        Add 1–10 dishes per meal, one dish per line.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (
            window.confirm(
              "Replace the dishes in this editor with sample dishes? Review them before publishing.",
            )
          )
            setMeals(
              Object.fromEntries(
                sampleMenu(date).meals.map((meal) => [
                  meal.mealType,
                  meal.dishes.join("\n"),
                ]),
              ),
            );
        }}
      >
        Use sample dishes as a starting point
      </button>
      <div className="menu-grid">
        {MEALS.map((meal) => (
          <label className="card capitalize" key={meal}>
            {meal}
            <textarea
              required
              rows={6}
              maxLength={810}
              disabled={busy}
              value={meals[meal]}
              onChange={(e) => setMeals({ ...meals, [meal]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <label>
        Announcement for this date
        <textarea
          rows={3}
          maxLength={500}
          disabled={busy}
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="For example: Dinner will be served from the east entrance today."
        />
      </label>
      <p className="small muted">
        Announcements appear on the selected service date and leave the student
        dashboard the next day. Leave blank to remove one. Verify dishes before
        publishing.
      </p>
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
      <button className="primary" disabled={busy}>
        {busy ? "Publishing…" : "Publish menu & announcement"}
      </button>
    </form>
  );
}
export default function ManageDining() {
  const [date, setDate] = useState(campusDate());
  const resource = useResource("/admin/dining?date=" + date);
  const day = resource.data?.days.find((item) => item.date === date);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">The dining noticeboard</p>
          <h1>Menus & announcements</h1>
          <p className="muted">Plan what students see before they book.</p>
        </div>
        <label>
          Service date
          <input
            type="date"
            required
            min={campusDate()}
            value={date}
            onChange={(e) => {
              if (e.target.value) setDate(e.target.value);
            }}
          />
        </label>
      </div>
      <ResourceState {...resource} />
      {resource.data && !resource.loading && !resource.error && (
        <Editor key={date} day={day} date={date} />
      )}
    </>
  );
}
