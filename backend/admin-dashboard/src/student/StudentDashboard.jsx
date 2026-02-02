import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [booking, setBooking] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("studentToken");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    window.location.href = "/student/login";
  };

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/students/profile`, authHeader);
        setStudent(res.data);
      } catch {
        setMessage("Session expired. Please login again.");
        setTimeout(handleLogout, 1500);
      }
    };
    fetchProfile();
  }, []);

  /* ================= BOOK MEAL ================= */
  const bookMeal = async (mealType) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${API}/bookings/create`,
        { mealType },
        authHeader
      );

      setBooking(res.data.booking);
      setQrCode(res.data.qrCode);
      setMessage(res.data.message);

    } catch (err) {
      setMessage(err.response?.data?.error || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!student) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
    <div style={styles.page}>
      {/* ===== STUDENT INFO ===== */}
      <div style={styles.card}>
        <h2>Welcome, {student.name} 👋</h2>
        <p><b>Roll No:</b> {student.rollNo}</p>
        <p><b>Hostel:</b> {student.hostel}</p>
        <p><b>Floor:</b> {student.floor}</p>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* ===== BOOKING SECTION ===== */}
      <div style={styles.card}>
        <h3>🍽 Book Today's Meal</h3>

        <div style={styles.btnRow}>
          <button
            disabled={loading || booking}
            onClick={() => bookMeal("breakfast")}
            style={styles.btn}
          >
            Breakfast
          </button>

          <button
            disabled={loading || booking}
            onClick={() => bookMeal("lunch")}
            style={styles.btn}
          >
            Lunch
          </button>

          <button
            disabled={loading || booking}
            onClick={() => bookMeal("dinner")}
            style={styles.btn}
          >
            Dinner
          </button>
        </div>

        {loading && <p style={{ marginTop: "10px" }}>Booking...</p>}
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>

      {/* ===== QR PASS ===== */}
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
  }
};
