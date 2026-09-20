import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/theme";
import DiningMenu from "../components/DiningMenu";
import { MEALS, campusDate, displayDate } from "../services/utils";

const times = {
  breakfast: ["07:30–07:45 AM", "08:00–08:15 AM"],
  lunch: ["12:00–12:15 PM", "12:30–12:45 PM"],
  snacks: ["05:00–05:15 PM", "05:30–05:45 PM"],
  dinner: ["08:00–08:15 PM", "08:30–08:45 PM"],
};
const menuResource = { data: { days: [] }, loading: false, error: "" };
function DemoPass({ booking, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      className="pass-dialog"
      ref={dialog}
      onCancel={onClose}
      aria-labelledby="demo-pass-title"
    >
      <span className="eyebrow">Preview only</span>
      <h2 id="demo-pass-title">Your demo entry pass</h2>
      <p className="capitalize">{booking.meal} · Floor 1</p>
      <p>{booking.time}</p>
      <div
        className="demo-pass-stamp"
        aria-label="Sample pass, not a valid QR code"
      >
        B<span>DEMO PASS</span>
      </div>
      <p>
        This is a visual preview, not a scannable gate pass. Real bookings
        receive a single-use QR code.
      </p>
      <button autoFocus className="primary" onClick={onClose}>
        Close pass
      </button>
    </dialog>
  );
}
export default function DemoDashboard() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState({});
  const [pass, setPass] = useState(null);
  const [message, setMessage] = useState("");
  const sequence = useRef(0);
  const active = bookings.filter((booking) => booking.status === "Reserved");
  const next = [...active].sort(
    (a, b) => MEALS.indexOf(a.meal) - MEALS.indexOf(b.meal),
  )[0];
  function book(meal) {
    const time = selected[meal] || times[meal][0];
    const booking = { id: ++sequence.current, meal, time, status: "Reserved" };
    setBookings((previous) =>
      previous.some((item) => item.meal === meal && item.status === "Reserved")
        ? previous
        : [booking, ...previous],
    );
    setMessage(
      "Demo reservation created. Try opening your pass, changing the time, or cancelling below.",
    );
    setPass(booking);
  }
  function reset() {
    setBookings([]);
    setSelected({});
    setPass(null);
    setMessage("Demo reset. You can explore from the beginning.");
  }
  return (
    <div className="student-shell">
      <header className="student-header">
        <Link className="brand" to="/">
          <span className="brand-mark">B</span>
          <span>
            Bennett Dining<small>Interactive student demo</small>
          </span>
        </Link>
        <div className="actions">
          <button onClick={toggleTheme}>
            {darkMode ? "Light theme" : "Dark theme"}
          </button>
          <button onClick={reset}>Reset demo</button>
          <Link to="/">Exit demo</Link>
        </div>
      </header>
      <main id="main-content" className="student-main">
        <aside className="sample-note">
          <strong>You’re exploring a demo.</strong> All student details, menus,
          and reservations here are samples. Changes stay in this page and reset
          when you refresh. No sign-in or real booking is made.
        </aside>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Bennett University · Campus dining</p>
            <h1>Hello, campus explorer</h1>
            <p className="muted">
              {displayDate(campusDate())} · Demo clock: 7:00 AM IST
            </p>
          </div>
          <div className="profile-chip">
            DEMO STUDENT
            <br />
            Sample hostel · Floor 1
          </div>
        </div>
        <section className="dining-hero" aria-labelledby="demo-next">
          <div>
            <span className="hero-kicker">
              Take a look around. Make yourself at home.
            </span>
            <h2 id="demo-next">
              {next
                ? "Your next meal is sorted."
                : "Your dining day, made simple."}
            </h2>
            <p>
              {next
                ? "This sample reservation is ready to explore."
                : "Browse the week’s menu and try reserving a meal. No password needed."}
            </p>
            {next ? (
              <>
                <div className="hero-ticket">
                  <span className="capitalize">{next.meal}</span>
                  <span>{next.time}</span>
                </div>
                <button className="gold-button" onClick={() => setPass(next)}>
                  Show demo pass ↗
                </button>
              </>
            ) : (
              <a className="gold-button" href="#reserve">
                Try a booking ↗
              </a>
            )}
          </div>
          <div className="hero-emblem" aria-hidden="true">
            <div className="plate">
              <span>B</span>
              <small>BENNETT DINING</small>
            </div>
            <span className="plate-caption">A seat for every meal.</span>
          </div>
        </section>
        <nav className="student-nav" aria-label="Demo navigation">
          <a href="#main-content">Today</a>
          <a href="#menu">Menu</a>
          <a href="#bookings">Bookings</a>
          <Link to="/">Sign in</Link>
        </nav>
        <aside className="announcement">
          <span className="eyebrow">Sample announcement</span>
          <p>
            Welcome to Bennett Dining. Keep your entry pass ready when you
            arrive at the mess.
          </p>
        </aside>
        <DiningMenu resource={menuResource} />
        <section
          id="reserve"
          className="section-gap"
          aria-labelledby="demo-book"
        >
          <h2 id="demo-book">Try reserving a meal</h2>
          <p className="muted">
            The demo stays at 7:00 AM so every meal can be explored. The real
            app uses the current time and closes booking 15 minutes before each
            slot.
          </p>
          <div className="meal-grid">
            {MEALS.map((meal) => {
              const reserved = active.some((item) => item.meal === meal);
              return (
                <article key={meal} className="card meal-card">
                  <span className="eyebrow">
                    {reserved ? "Demo seat reserved" : "Sample availability"}
                  </span>
                  <h3 className="capitalize">{meal}</h3>
                  <p className="muted">
                    {reserved ? "19" : "20"} sample seats available
                  </p>
                  <label>
                    Preferred time
                    <select
                      disabled={reserved}
                      value={selected[meal] || times[meal][0]}
                      onChange={(event) =>
                        setSelected({ ...selected, [meal]: event.target.value })
                      }
                    >
                      {times[meal].map((time) => (
                        <option key={time}>{time}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="primary"
                    disabled={reserved}
                    onClick={() => book(meal)}
                  >
                    {reserved ? "Booked in demo" : "Try booking " + meal}
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
        <section
          id="bookings"
          className="section-gap"
          aria-labelledby="demo-history"
        >
          <h2 id="demo-history">Your demo bookings</h2>
          {!bookings.length && (
            <div className="card empty">
              Your first reservation starts above. Choose a meal to see its pass
              and booking controls here.
            </div>
          )}
          <div className="booking-grid">
            {bookings.map((booking) => (
              <article key={booking.id} className="card">
                <div className="page-heading">
                  <h3 className="capitalize">{booking.meal}</h3>
                  <span className="badge">{booking.status}</span>
                </div>
                <p>{booking.time} · Floor 1</p>
                {booking.status === "Reserved" && (
                  <>
                    <div className="actions">
                      <button
                        className="primary"
                        onClick={() => setPass(booking)}
                      >
                        View demo pass
                      </button>
                      <button
                        onClick={() => {
                          setBookings((previous) =>
                            previous.map((item) =>
                              item.id === booking.id
                                ? { ...item, status: "Cancelled" }
                                : item,
                            ),
                          );
                          setMessage(
                            "Demo reservation cancelled. The sample seat is available again.",
                          );
                        }}
                      >
                        Cancel booking
                      </button>
                    </div>
                    <label className="section-gap">
                      Change time
                      <select
                        value={booking.time}
                        onChange={(event) => {
                          const time = event.target.value;
                          setBookings((previous) =>
                            previous.map((item) =>
                              item.id === booking.id ? { ...item, time } : item,
                            ),
                          );
                          setMessage("Demo reservation moved to " + time);
                        }}
                      >
                        {times[booking.meal].map((time) => (
                          <option key={time}>{time}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
      {pass && <DemoPass booking={pass} onClose={() => setPass(null)} />}
    </div>
  );
}
