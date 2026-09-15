import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import api from "../services/api";
import { campusDate, errorMessage, displayDate } from "../services/utils";
import useResource from "../hooks/useResource";
import ResourceState from "../components/ResourceState";
export default function DailyAnalytics() {
  const [date, setDate] = useState(campusDate()),
    [error, setError] = useState(""),
    [exporting, setExporting] = useState(false);
  const daily = useResource("/admin/analytics/daily?date=" + date, 30000);
  const weekly = useResource("/admin/analytics/weekly?date=" + date, 30000);
  const meals = daily.data?.meals || [];
  const booked = meals.reduce((sum, row) => sum + row.totalBookings, 0),
    consumed = meals.reduce((sum, row) => sum + row.totalConsumed, 0);
  async function download() {
    setExporting(true);
    setError("");
    try {
      const response = await api.get("/admin/reports?date=" + date, {
        responseType: "blob",
        timeout: 60000,
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mess-report-" + date + ".csv";
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setExporting(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Campus dining overview</p>
          <h1>Make every meal count.</h1>
          <p className="muted">
            {displayDate(date)} · Updates every 30 seconds
          </p>
        </div>
        <div className="actions">
          <label>
            Report date
            <input
              type="date"
              value={date}
              onChange={(event) => {
                if (event.target.value) setDate(event.target.value);
              }}
            />
          </label>
          <button className="primary" disabled={exporting} onClick={download}>
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <ResourceState {...daily} />
      <div className="stats-grid">
        {[
          ["Reservations", booked],
          ["Meals consumed", consumed],
          ["Unique students", daily.data?.totalStudents || 0],
          ["Not yet consumed", booked - consumed],
        ].map(([label, value]) => (
          <div className="card stat" key={label}>
            <span className="muted">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <section className="card">
          <h2>Meals on the selected date</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={meals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                name="Reservations"
                dataKey="totalBookings"
                fill="#0f766e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Consumed"
                dataKey="totalConsumed"
                fill="#d97706"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="card">
          <h2>Seven-day trend</h2>
          <ResourceState {...weekly} />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weekly.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tickFormatter={(value) => value.slice(5)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                name="Reservations"
                dataKey="totalBookings"
                stroke="#0f766e"
                strokeWidth={2}
              />
              <Line
                name="Consumed"
                dataKey="totalConsumed"
                stroke="#d97706"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
      <section className="card section-gap">
        <h2>Meal totals</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Meal</th>
                <th>Reservations</th>
                <th>Consumed</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => (
                <tr key={meal._id}>
                  <td className="capitalize">{meal._id}</td>
                  <td>{meal.totalBookings}</td>
                  <td>{meal.totalConsumed}</td>
                  <td>{meal.totalBookings - meal.totalConsumed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          Remaining reservations may still be used during their meal window.
          Cancelled bookings are excluded.
        </p>
      </section>
    </>
  );
}
