import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>📋 All Bookings</h2>

      <div style={{ overflowX: "auto", marginTop: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1e293b", color: "white" }}>
              <th style={th}>Student</th>
              <th style={th}>Roll No</th>
              <th style={th}>Meal</th>
              <th style={th}>Floor</th>
              <th style={th}>Slot Time</th>
              <th style={th}>QR Used</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id} style={{ borderBottom: "1px solid #334155" }}>
                <td style={td}>{b.student?.name}</td>
                <td style={td}>{b.student?.rollNumber}</td>
                <td style={td}>{b.mealType}</td>
                <td style={td}>{b.floor}</td>
                <td style={td}>
                  {b.slot?.startTime} - {b.slot?.endTime}
                </td>
                <td style={td}>
                  {b.qrUsed ? "✅ Yes" : "❌ No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { padding: "12px", textAlign: "left" };
const td = { padding: "10px" };
