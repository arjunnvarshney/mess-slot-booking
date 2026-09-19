import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { logout } from "../services/session";
import {
  MEALS,
  campusDate,
  errorMessage,
  bookingStatus,
  canChange,
  displayDate,
} from "../services/utils";
import { ThemeContext } from "../context/theme";
import useResource from "../hooks/useResource";
import ResourceState from "../components/ResourceState";
import Pagination from "../components/Pagination";
import QRPass from "../components/QRPass";
import DiningMenu from "../components/DiningMenu";
import { nextMeal } from "../services/dining";
export default function StudentDashboard() {
  const profile = useResource("/students/profile", 60000);
  const slots = useResource("/slots/today", 30000);
  const todayBookings = useResource("/bookings/today", 30000);
  const dining = useResource("/students/dining?date=" + campusDate(), 30000);
  const upcoming = nextMeal(todayBookings.data);
  const announcement = dining.data?.days.find(
    (day) => day.date === campusDate(),
  )?.announcement;
  const [page, setPage] = useState(1);
  const history = useResource("/bookings/my?page=" + page, 30000);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [pass, setPass] = useState(null),
    [selected, setSelected] = useState({});
  const lock = useRef(false);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  async function action(url, body, openPass = false) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await api.post(url, body);
      setMessage(response.data.message);
      if (openPass) setPass(response.data.booking);
      history.reload();
      slots.reload();
      todayBookings.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="student-shell">
      <header className="student-header">
        <Link className="brand" to="/student/dashboard">
          <span className="brand-mark">B</span>
          <span>
            Bennett Dining<small>Made for your campus day</small>
          </span>
        </Link>
        <div className="actions">
          <button onClick={toggleTheme}>
            {darkMode ? "Light theme" : "Dark theme"}
          </button>
          <Link to="/student/settings">Account</Link>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <main id="main-content" className="student-main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Bennett University · Campus dining</p>
            <h1>
              {profile.data ? "Hello, " + profile.data.name : "Your meals"}
            </h1>
            <p className="muted">
              {displayDate(campusDate())} · All times are India Standard Time
            </p>
          </div>
          {profile.data && (
            <div className="profile-chip">
              {profile.data.rollNo}
              <br />
              {profile.data.hostel} · Floor {profile.data.floor}
            </div>
          )}
        </div>
        <ResourceState {...profile} />
        <section className="dining-hero" aria-labelledby="next-meal-title">
          <div>
            <span className="hero-kicker">
              A little less waiting. A better dining day.
            </span>
            <h2 id="next-meal-title">
              {upcoming ? "Your next meal is sorted." : "Good food. Your time."}
            </h2>
            <p>
              {upcoming
                ? "Your seat is reserved. Open your pass when you reach the mess."
                : "Explore the menu, pick a slot, and make time for a proper break."}
            </p>
            {upcoming ? (
              <>
                <div className="hero-ticket">
                  <span className="capitalize">{upcoming.mealType}</span>
                  <span>{upcoming.slotTime}</span>
                  <span>Floor {upcoming.floor}</span>
                </div>
                <button
                  className="gold-button"
                  onClick={() => setPass(upcoming)}
                >
                  Show entry pass <span aria-hidden="true">↗</span>
                </button>
              </>
            ) : (
              <a className="gold-button" href="#reserve">
                Find a meal slot <span aria-hidden="true">↗</span>
              </a>
            )}
            <ResourceState {...todayBookings} />
          </div>
          <div className="hero-emblem" aria-hidden="true">
            <div className="plate">
              <span>B</span>
              <small>BENNETT DINING</small>
            </div>
            <span className="plate-caption">A seat for every meal.</span>
          </div>
        </section>
        {announcement && (
          <aside className="announcement">
            <span className="eyebrow">From the mess team · Today</span>
            <p>{announcement}</p>
          </aside>
        )}
        <nav className="student-nav" aria-label="Student navigation">
          <a href="#main-content">Today</a>
          <a href="#menu">Menu</a>
          <a href="#bookings">Bookings</a>
          <Link to="/student/settings">Profile</Link>
        </nav>
        <DiningMenu resource={dining} />
        <section
          className="section-gap"
          id="reserve"
          aria-labelledby="book-title"
        >
          <h2 id="book-title">Reserve a meal</h2>
          <p className="muted">
            Booking and changes close 15 minutes before a slot starts.
          </p>
          <ResourceState {...slots} />
          {todayBookings.error && <ResourceState {...todayBookings} />}
          <div className="meal-grid">
            {MEALS.map((meal) => {
              const options = (slots.data || []).filter(
                (slot) => slot.mealType === meal && slot.bookable,
              );
              const alreadyBooked = todayBookings.data?.some(
                (booking) => booking.mealType === meal,
              );
              return (
                <article className="card meal-card" key={meal}>
                  <span className="eyebrow">
                    {alreadyBooked
                      ? "Your seat is reserved"
                      : options.length
                        ? "Open for booking"
                        : "Booking closed"}
                  </span>
                  <h3 className="capitalize">{meal}</h3>
                  <p className="muted">
                    {options.length
                      ? options.reduce((sum, slot) => sum + slot.available, 0) +
                        " seats available"
                      : "No open slots right now"}
                  </p>
                  <label>
                    Preferred time
                    <select
                      value={selected[meal] || ""}
                      onChange={(event) =>
                        setSelected({ ...selected, [meal]: event.target.value })
                      }
                      disabled={!options.length}
                    >
                      <option value="">Earliest available</option>
                      {options.map((slot) => (
                        <option key={slot._id} value={slot._id}>
                          {slot.startTime} – {slot.endTime} · {slot.available}{" "}
                          seats
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="primary"
                    disabled={
                      busy || alreadyBooked || !options.length || !profile.data
                    }
                    onClick={() =>
                      action(
                        "/bookings/create",
                        { mealType: meal, slotId: selected[meal] || undefined },
                        true,
                      )
                    }
                  >
                    {alreadyBooked ? "Booked today" : "Book " + meal}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
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
        <section
          className="section-gap"
          id="bookings"
          aria-labelledby="history-title"
        >
          <div className="page-heading">
            <h2 id="history-title">Your bookings</h2>
            <button onClick={history.reload}>Refresh</button>
          </div>
          <ResourceState {...history} empty={!history.data?.items.length} />
          <div className="booking-grid">
            {history.data?.items.map((booking) => {
              const status = bookingStatus(booking);
              const replacements = (slots.data || []).filter(
                (slot) =>
                  slot.mealType === booking.mealType &&
                  slot.bookable &&
                  slot._id !== booking.slot?._id,
              );
              return (
                <article className="card" key={booking._id}>
                  <div className="page-heading">
                    <h3 className="capitalize">{booking.mealType}</h3>
                    <span className={"badge " + status.toLowerCase()}>
                      {status}
                    </span>
                  </div>
                  <p>{displayDate(booking.serviceDate || booking.date)}</p>
                  <p>
                    {booking.slotTime ||
                      (booking.slot
                        ? booking.slot.startTime + " – " + booking.slot.endTime
                        : "Historical slot")}{" "}
                    · Floor {booking.floor}
                  </p>
                  <div className="actions">
                    {status === "Active" && (
                      <button
                        className="primary"
                        onClick={() => setPass(booking)}
                      >
                        View entry pass
                      </button>
                    )}
                    {canChange(booking) && (
                      <button
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Cancel this meal and release your seat?",
                            )
                          )
                            action("/bookings/" + booking._id + "/cancel");
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {canChange(booking) && replacements.length > 0 && (
                    <form
                      className="inline-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        action(
                          "/bookings/" + booking._id + "/reschedule",
                          {
                            slotId: new FormData(event.currentTarget).get(
                              "slotId",
                            ),
                          },
                          true,
                        );
                      }}
                    >
                      <label>
                        Move to
                        <select name="slotId">
                          {replacements.map((slot) => (
                            <option value={slot._id} key={slot._id}>
                              {slot.startTime} – {slot.endTime}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button disabled={busy}>Reschedule</button>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
          <Pagination data={history.data} page={page} setPage={setPage} />
        </section>
      </main>
      {pass && (
        <QRPass key={pass._id} booking={pass} onClose={() => setPass(null)} />
      )}
    </div>
  );
}
