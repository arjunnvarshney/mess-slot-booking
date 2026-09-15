import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { logout } from "../services/session";
import { errorMessage } from "../services/utils";
export default function Settings({ role = "admin" }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function changePassword(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get("newPassword") !== data.get("confirm")) {
      setError("New passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.put(
        role === "admin" ? "/admin/password" : "/students/password",
        {
          currentPassword: data.get("currentPassword"),
          newPassword: data.get("newPassword"),
        },
      );
      logout();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      id={role === "student" ? "main-content" : undefined}
      className={role === "student" ? "student-main" : ""}
    >
      <Link to={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}>
        ← Back to dashboard
      </Link>
      <h1 className="section-gap">Account settings</h1>
      <p className="muted">
        Password changes end existing sessions on all devices.
      </p>
      <form className="card stack settings-form" onSubmit={changePassword}>
        <h2>Change password</h2>
        <label>
          Current password
          <input
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          New password
          <input
            type="password"
            name="newPassword"
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            name="confirm"
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </label>
        <p className="muted small">
          At least 12 characters, at most 72 UTF-8 bytes.
        </p>
        <button disabled={busy} className="primary">
          Change password and sign out
        </button>
      </form>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="notice success" role="status">
          {message}
        </p>
      )}
      {role === "admin" && (
        <details className="card settings-form section-gap">
          <summary>Add an administrator</summary>
          <form
            className="stack section-gap"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              setBusy(true);
              setError("");
              setMessage("");
              try {
                await api.post(
                  "/admin/register",
                  Object.fromEntries(new FormData(form)),
                );
                setMessage("Administrator created");
                form.reset();
              } catch (error) {
                setError(errorMessage(error));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Username
              <input
                name="username"
                required
                maxLength={100}
                autoComplete="off"
              />
            </label>
            <label>
              Initial password
              <input
                name="password"
                type="password"
                required
                minLength={12}
                maxLength={72}
                autoComplete="new-password"
              />
            </label>
            <button disabled={busy}>Create administrator</button>
          </form>
        </details>
      )}
    </section>
  );
}
