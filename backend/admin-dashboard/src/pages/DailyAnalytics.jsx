import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import api from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, LineChart, Line,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#E91E63"];

export default function DailyAnalytics({ onLogout }) {
  const { darkMode } = useContext(ThemeContext);

  const cardStyle = {
    flex: "1",
    minWidth: "220px",
    padding: "22px",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    background: darkMode ? "#1e293b" : "white",
    color: darkMode ? "white" : "#0f172a"
  };

  const chartCard = {
    padding: "25px",
    borderRadius: "14px",
    marginTop: "35px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    background: darkMode ? "#1e293b" : "white"
  };

  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [floorData, setFloorData] = useState([]);
  const [slotData, setSlotData] = useState([]);
  const [noShowData, setNoShowData] = useState([]);
  const [statsToday, setStatsToday] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const daily = await api.get(`/admin/analytics/daily?date=${selectedDate}`);
        setDailyData(daily.data.map(item => ({
          meal: item._id.toUpperCase(),
          bookings: item.totalBookings,
          consumed: item.totalConsumed
        })));

        const weekly = await api.get("/admin/analytics/weekly");
        setWeeklyData(weekly.data.map(item => ({
          date: item._id,
          bookings: item.totalBookings,
          consumed: item.totalConsumed
        })));

        const floor = await api.get("/admin/analytics/floor");
        setFloorData(floor.data.map(item => ({
          name: `Floor ${item._id}`,
          value: item.totalStudents
        })));

        const slots = await api.get(`/admin/analytics/slots?date=${selectedDate}`);
        setSlotData(slots.data);

        const noShow = await api.get(`/admin/analytics/no-show?date=${selectedDate}`);
        setNoShowData(noShow.data.students || []);

        const stats = await api.get("/admin/stats/today");
        setStatsToday(stats.data);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [selectedDate]);

  const downloadReport = async () => {
    const res = await api.get("/admin/reports/today");
    const rows = res.data;

    const csv = [
      ["Name", "Roll No", "Hostel", "Floor"],
      ...rows.map(b => [
        b.student?.name,
        b.student?.rollNo,
        b.student?.hostel,
        b.student?.floor
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mess_report_today.csv";
    link.click();
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "30px 40px",
      background: darkMode ? "#0f172a" : "#f1f5f9",
      color: darkMode ? "#f1f5f9" : "#0f172a"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <h1>📊 Daily Analytics</h1>
        <div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          <button onClick={downloadReport} style={{ marginLeft: "10px" }}>⬇ Export Report</button>
        </div>
      </div>

      {loading && <p>Loading dashboard...</p>}

      {statsToday && (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={cardStyle}><h4>Breakfast</h4><p>{statsToday.breakfast}</p></div>
          <div style={cardStyle}><h4>Lunch</h4><p>{statsToday.lunch}</p></div>
          <div style={cardStyle}><h4>Dinner</h4><p>{statsToday.dinner}</p></div>
          <div style={cardStyle}><h4>Unique Students</h4><p>{statsToday.totalStudents}</p></div>
        </div>
      )}

      {dailyData.length > 0 && (
        <div style={chartCard}>
          <h2>Meal Booking Overview</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="meal" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#4CAF50" />
              <Bar dataKey="consumed" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {weeklyData.length > 0 && (
        <div style={chartCard}>
          <h2>Weekly Trend</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#4CAF50" />
              <Line type="monotone" dataKey="consumed" stroke="#2196F3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {floorData.length > 0 && (
        <div style={chartCard}>
          <h2>Floor Distribution</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={floorData} dataKey="value" nameKey="name" outerRadius={120}>
                {floorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
