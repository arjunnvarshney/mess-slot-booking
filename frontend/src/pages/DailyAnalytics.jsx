import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import api from "../services/api";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, Legend, LineChart, Line,
    PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#E91E63"];

export default function DailyAnalytics() {
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

                // Fetching stats for top cards
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
        try {
            const res = await api.get("/admin/reports/today");
            const rows = res.data;

            const csv = [
                ["Name", "Roll No", "Hostel", "Floor", "Meal", "Used"],
                ...rows.map(b => [
                    b.student?.name,
                    b.student?.rollNo,
                    b.student?.hostel,
                    b.student?.floor,
                    b.mealType,
                    b.qrUsed ? "YES" : "NO"
                ])
            ].map(e => e.join(",")).join("\n");

            const blob = new Blob([csv], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `mess_report_${selectedDate}.csv`;
            link.click();
        } catch (err) {
            alert("Failed to download report");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            padding: "30px 40px",
            background: darkMode ? "#0f172a" : "#f1f5f9",
            color: darkMode ? "#f1f5f9" : "#0f172a"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                <h1>📊 Daily Analytics</h1>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                    <button
                        onClick={downloadReport}
                        style={{
                            padding: "8px 16px",
                            background: "#0f766e",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        ⬇ Export Report
                    </button>
                </div>
            </div>

            {loading && <p>Loading dashboard...</p>}

            {statsToday && (
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <div style={cardStyle}><h4>Breakfast</h4><p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsToday.breakfast}</p></div>
                    <div style={cardStyle}><h4>Lunch</h4><p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsToday.lunch}</p></div>
                    <div style={cardStyle}><h4>Dinner</h4><p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsToday.dinner}</p></div>
                    <div style={cardStyle}><h4>Unique Students</h4><p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsToday.totalStudents}</p></div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                {dailyData.length > 0 && (
                    <div style={chartCard}>
                        <h2 style={{ marginBottom: "20px" }}>Meal Booking Overview</h2>
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
                        <h2 style={{ marginBottom: "20px" }}>Weekly Trend</h2>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="bookings" stroke="#4CAF50" strokeWidth={3} />
                                <Line type="monotone" dataKey="consumed" stroke="#2196F3" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
