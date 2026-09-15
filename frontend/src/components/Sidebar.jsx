import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { ThemeContext } from "../context/theme";
import { logout } from "../services/session";
export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">M</span>
        <div>
          Campus Mess<small>Administration</small>
        </div>
      </div>
      <button
        className="mobile-toggle"
        aria-expanded={open}
        aria-controls="admin-navigation"
        onClick={() => setOpen(!open)}
      >
        Menu
      </button>
      <nav
        id="admin-navigation"
        className={open ? "nav open" : "nav"}
        aria-label="Administration"
      >
        {[
          ["dashboard", "Overview"],
          ["bookings", "Bookings"],
          ["students", "Students"],
          ["slots", "Meal slots"],
          ["scanner", "Gate scanner"],
          ["settings", "Account"],
        ].map(([path, label]) => (
          <NavLink
            key={path}
            to={"/admin/" + path}
            onClick={() => setOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-actions">
        <button onClick={toggleTheme}>
          {darkMode ? "Light theme" : "Dark theme"}
        </button>
        <button onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}
