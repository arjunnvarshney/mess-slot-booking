import { useState } from "react";
import api from "../services/api";
import { errorMessage } from "../services/utils";
import useResource from "../hooks/useResource";
import ResourceState from "../components/ResourceState";
import Pagination from "../components/Pagination";
export default function AdminStudents() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [resetId, setResetId] = useState("");
  const resource = useResource(
    "/admin/students?" + new URLSearchParams({ page, search }),
  );
  async function mutate(method, path, data, form) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await api[method](path, data);
      setMessage(response.data.message);
      form?.reset();
      setResetId("");
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
          <p className="eyebrow">Student access</p>
          <h1>Students</h1>
          <p className="muted">
            Enroll students, assign dining floors, and manage access.
          </p>
        </div>
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(String(new FormData(event.currentTarget).get("search")));
            setPage(1);
          }}
        >
          <label>
            Search name or roll number
            <input name="search" maxLength={100} type="search" />
          </label>
          <button>Search</button>
        </form>
      </div>
      <details className="card">
        <summary>Enroll a student</summary>
        <form
          className="form-grid section-gap"
          onSubmit={(event) => {
            event.preventDefault();
            mutate(
              "post",
              "/admin/students",
              Object.fromEntries(new FormData(event.currentTarget)),
              event.currentTarget,
            );
          }}
        >
          <label>
            Roll number
            <input
              name="rollNo"
              required
              maxLength={40}
              pattern="[A-Za-z0-9-]+"
            />
          </label>
          <label>
            Full name
            <input name="name" required maxLength={100} />
          </label>
          <label>
            Hostel
            <input name="hostel" required maxLength={100} />
          </label>
          <label>
            Dining floor
            <select name="floor">
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
            </select>
          </label>
          <label>
            Initial password
            <input
              name="password"
              type="password"
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              required
            />
          </label>
          <button disabled={busy} className="primary">
            Enroll student
          </button>
        </form>
      </details>
      <details className="card section-gap">
        <summary>Bulk enrollment</summary>
        <p className="muted small">
          Upload a JSON array of up to 100 records with rollNo, name, hostel,
          floor, and password. Each password needs at least 12 characters. The
          entire import succeeds or is rolled back.
        </p>
        <form
          className="inline-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const file = new FormData(form).get("file");
            try {
              if (file.size > 120000)
                throw new Error("File must be smaller than 120 KB");
              const students = JSON.parse(await file.text());
              await mutate(
                "post",
                "/admin/students/import",
                { students },
                form,
              );
            } catch (error) {
              setError(error.message || "Invalid JSON file");
            }
          }}
        >
          <label>
            Enrollment file
            <input
              name="file"
              type="file"
              accept=".json,application/json"
              required
            />
          </label>
          <button disabled={busy}>Import students</button>
        </form>
      </details>
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
              <th>Name</th>
              <th>Roll number</th>
              <th>Hostel</th>
              <th>Floor</th>
              <th>Access</th>
              <th>Account</th>
            </tr>
          </thead>
          <tbody>
            {resource.data?.items.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.rollNo}</td>
                <td>{student.hostel}</td>
                <td>
                  <select
                    aria-label={"Dining floor for " + student.name}
                    value={student.floor}
                    disabled={busy}
                    onChange={(event) =>
                      mutate(
                        "put",
                        "/admin/students/" + student._id + "/floor",
                        { floor: Number(event.target.value) },
                      )
                    }
                  >
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                  </select>
                </td>
                <td>
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          (student.active === false
                            ? "Restore"
                            : "Deactivate") +
                            " access for " +
                            student.name +
                            "?",
                        )
                      )
                        mutate(
                          "put",
                          "/admin/students/" + student._id + "/active",
                          { active: student.active === false },
                        );
                    }}
                  >
                    {student.active === false ? "Restore access" : "Deactivate"}
                  </button>
                </td>
                <td>
                  {resetId === student._id ? (
                    <form
                      className="inline-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        mutate(
                          "put",
                          "/admin/students/" + student._id + "/password",
                          {
                            password: new FormData(event.currentTarget).get(
                              "password",
                            ),
                          },
                        );
                      }}
                    >
                      <input
                        name="password"
                        type="password"
                        minLength={12}
                        maxLength={72}
                        required
                        autoComplete="new-password"
                        aria-label={"New password for " + student.name}
                      />
                      <button disabled={busy}>Save</button>
                      <button type="button" onClick={() => setResetId("")}>
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button onClick={() => setResetId(student._id)}>
                      Reset password
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination data={resource.data} page={page} setPage={setPage} />
      <p className="muted small">
        Students with upcoming unused bookings must cancel them before a floor
        change or deactivation. Historical records are retained.
      </p>
    </>
  );
}
