import { useState } from "react";
import { campusDate, displayDate } from "../services/utils";
import { menuFor, weekDates } from "../services/dining";
import ResourceState from "./ResourceState";
export default function DiningMenu({ resource }) {
  const today = campusDate();
  const [selected, setSelected] = useState(today);
  const days = weekDates(today);
  const date = days.includes(selected) ? selected : today;
  const menu = menuFor(resource.data?.days, date);
  return (
    <section
      className="section-gap menu-section"
      id="menu"
      aria-labelledby="menu-title"
    >
      <div className="page-heading">
        <div>
          <span className="eyebrow">Something to look forward to</span>
          <h2 id="menu-title">On the menu</h2>
        </div>
        <span className="muted small">The next seven days</span>
      </div>
      <div className="day-selector" aria-label="Choose menu date">
        {days.map((day) => (
          <button
            key={day}
            aria-pressed={day === date}
            onClick={() => setSelected(day)}
          >
            {day === today
              ? "Today"
              : new Intl.DateTimeFormat("en-IN", {
                  weekday: "short",
                  timeZone: "Asia/Kolkata",
                }).format(new Date(day + "T12:00:00Z"))}
            <small>{displayDate(day).split(" ").slice(0, 2).join(" ")}</small>
          </button>
        ))}
      </div>
      <ResourceState {...resource} />
      {menu.sample && (
        <p className="sample-note">
          Sample menu · Illustrative dishes, not the confirmed Bennett mess
          menu. Staff can publish the actual menu.
        </p>
      )}
      {!menu.sample && (
        <p className="published-note">
          Published by dining administration · {displayDate(date)}
        </p>
      )}
      <div className="menu-grid">
        {menu.meals.map((meal, index) => (
          <article className="card menu-card" key={meal.mealType}>
            <span className="menu-number" aria-hidden="true">
              0{index + 1}
            </span>
            <h3 className="capitalize">{meal.mealType}</h3>
            <ul>
              {meal.dishes.map((dish, i) => (
                <li key={i}>{dish}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="small muted">
        For ingredients and allergens, check with the mess team. Menu items do
        not guarantee allergen-free preparation.
      </p>
    </section>
  );
}
