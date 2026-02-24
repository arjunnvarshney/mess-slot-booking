import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function UnifiedLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    console.log("Student Login Attempted:", email);
    setError("");
    setLoading(true);

    if (!email.endsWith("@bennett.edu.in")) {
      setError("Only @bennett.edu.in email allowed");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/students/auth/login", {
        rollNo: email.split("@")[0].toUpperCase(),
        password
      });

      console.log("Login Success:", res.data);
      localStorage.removeItem("adminToken"); // Clear admin token if exists
      localStorage.setItem("studentToken", res.data.token);
      navigate("/student/dashboard");

    } catch (err) {
      console.error("Login error details:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Invalid student credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.card}>
        {/* Use PUBLIC folder images */}
        <img src="/bennett-logo.png" alt="Bennett Logo" style={styles.logo} />

        <h2 style={{ marginBottom: "5px" }}>Bennett University</h2>
        <p style={{ opacity: 0.7 }}>Student Login</p>

        <form onSubmit={handleStudentLogin}>
          <input
            style={styles.input}
            placeholder="Email (@bennett.edu.in)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as Student"}
          </button>
        </form>

        <hr style={{ margin: "20px 0", opacity: 0.3 }} />

        <button
          style={styles.adminBtn}
          onClick={() => navigate("/admin/login")}
        >
          Admin / Mess Committee Login
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: "url('/bennett-bg.jpg')", // PUBLIC image
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)"
  },
  card: {
    position: "relative",
    zIndex: 2,
    width: "360px",
    background: "rgba(255,255,255,0.97)",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
    textAlign: "center"
  },
  logo: {
    width: "120px",
    marginBottom: "10px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },
  loginBtn: {
    width: "100%",
    marginTop: "18px",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#0f766e",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  },
  adminBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#1e293b",
    color: "white",
    cursor: "pointer",
    fontWeight: "500"
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    marginTop: "10px"
  }
};
