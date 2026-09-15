import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { saveSession } from "../services/session";
import { errorMessage } from "../services/utils";
export default function LoginForm({ role }) {
  const admin = role === "admin";
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    let identifier = String(data.get("identifier")).trim();
    if (!admin) {
      const match = identifier.match(/^([a-z0-9-]+)@bennett\.edu\.in$/i);
      if (!match) {
        setError("Use your Bennett university email address.");
        return;
      }
      identifier = match[1].toUpperCase();
    }
    setBusy(true);
    setError("");
    try {
      const response = await api.post(
        admin ? "/admin/login" : "/students/auth/login",
        {
          [admin ? "username" : "rollNo"]: identifier,
          password: data.get("password"),
        },
      );
      saveSession(role, response.data.token, data.get("remember") === "on");
      navigate(admin ? "/admin/dashboard" : "/student/dashboard", {
        replace: true,
      });
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main-content" className="login-page">
      <section className="login-story">
        <div className="brand">
          <span className="brand-mark">M</span>Campus Mess
        </div>
        <h1>A seat for every meal.</h1>
        <p>
          Plan your day, reserve your meal, and walk in with your entry pass.
        </p>
        <span className="eyebrow">Bennett University · Campus dining</span>
      </section>
      <section className="login-panel">
        <img
          src="/bennett-logo.png"
          alt="Bennett University"
          className="university-logo"
        />
        <h2>{admin ? "Welcome, administrator" : "Welcome back"}</h2>
        <p className="muted">
          {admin
            ? "Manage dining, students, and gate entry."
            : "Sign in with your enrolled student account."}
        </p>
        {params.has("expired") && (
          <p className="notice">Your session ended. Please sign in again.</p>
        )}
        <form onSubmit={submit} className="stack">
          <label>
            {admin ? "Username" : "University email"}
            <input
              name="identifier"
              type={admin ? "text" : "email"}
              autoComplete="username"
              required
              maxLength={100}
              placeholder={
                admin ? "Your username" : "rollnumber@bennett.edu.in"
              }
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                maxLength={72}
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <label className="checkbox">
            <input type="checkbox" name="remember" />
            Keep me signed in on this device
          </label>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="muted small">
          Need an account or password reset? Contact the mess administrator.
        </p>
        <Link to={admin ? "/" : "/admin/login"}>
          {admin ? "Student sign in" : "Administrator sign in"} →
        </Link>
      </section>
    </main>
  );
}
