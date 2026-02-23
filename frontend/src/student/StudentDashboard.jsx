import { useEffect, useState } from "react";
import api from "../services/api";

export default function StudentDashboard({ onLogout }) {
  const [student, setStudent] = useState(null);
  const [booking, setBooking] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [myBookings, setMyBookings] = useState([]);

  /* ================= LOAD PROFILE + BOOKINGS ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/students/profile");
        setStudent(res.data);
      } catch {
        setMessage("Session expired. Please login again.");
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my");
        setMyBookings(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
    fetchBookings();
  }, []);

  /* ================= BOOK MEAL ================= */
  const bookMeal = async (mealType) => {
    try {
      const res = await api.post("/bookings/create", { mealType });

      setBooking(res.data.booking);
      setQrCode(res.data.qrCode);
      setMessage(res.data.message);

    } catch (err) {
      setMessage(err.response?.data?.error || "Booking failed");
    }
  };

  if (!student) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
    <div style={styles.page}>
      {/* PROFILE CARD */}
      <div style={styles.card}>
        <h2>Welcome, {student.name} 👋</h2>
        <p><b>Roll No:</b> {student.rollNo}</p>
        <p><b>Hostel:</b> {student.hostel}</p>
        <p><b>Floor:</b> {student.floor}</p>

        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* BOOK MEAL CARD */}
      <div style={styles.card}>
        <h3>🍽 Book Today's Meal</h3>

        <div style={styles.btnRow}>
          <button onClick={() => bookMeal("breakfast")} style={styles.btn}>Breakfast</button>
          <button onClick={() => bookMeal("lunch")} style={styles.btn}>Lunch</button>
          <button onClick={() => bookMeal("dinner")} style={styles.btn}>Dinner</button>
        </div>

        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>

      {/* QR CARD */}
      {booking && qrCode && (
        <div style={styles.card}>
          <h3>🎟 Your Mess Entry Pass</h3>
          <p><b>Meal:</b> {booking.mealType}</p>
          <p><b>Time:</b> {booking.slotTime}</p>
          <p><b>Floor:</b> {booking.floor}</p>

          <img src={qrCode} alt="QR Code" style={styles.qr} />
          <p style={{ fontSize: "12px", opacity: 0.7 }}>
            Show this QR at mess entrance
          </p>
        </div>
      )}

      {/* BOOKING HISTORY */}
      {myBookings.length > 0 && (
        <div style={styles.card}>
          <h3>📜 My Bookings</h3>

          {myBookings.map((b) => (
            <div key={b._id} style={styles.bookingItem}>
              <p><b>Meal:</b> {b.mealType}</p>
              <p><b>Time:</b> {b.slot?.startTime} - {b.slot?.endTime}</p>
              <p><b>Floor:</b> {b.floor}</p>
              <p><b>Status:</b> {b.qrUsed ? "Used" : "Active"}</p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "center"
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
  },
  btnRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "10px"
  },
  btn: {
    flex: 1,
    padding: "10px",
    background: "#2563eb",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer"
  },
  qr: {
    width: "200px",
    marginTop: "10px",
    background: "white",
    padding: "10px",
    borderRadius: "10px"
  },
  logoutBtn: {
    marginTop: "10px",
    padding: "8px 14px",
    background: "#dc2626",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer"
  },
  bookingItem: {
    fontSize: "14px",
    marginBottom: "10px"
  }
};
