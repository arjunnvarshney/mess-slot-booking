import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Student states
  const [email, setEmail] = useState("");
  const [studentPass, setStudentPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Admin states
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  /* ================= STUDENT LOGIN ================= */
  const handleStudentLogin = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@bennett.edu.in")) {
      return alert("Use your Bennett email only");
    }

    const rollNo = email.split("@")[0]; // Convert email → roll number

    try {
      const res = await api.post("/students/auth/login", {
        rollNo,
        password: studentPass,
      });

      if (remember) localStorage.setItem("studentToken", res.data.token);
      else sessionStorage.setItem("studentToken", res.data.token);

      navigate("/student/dashboard");
    } catch {
      alert("Invalid student credentials");
    }
  };

  /* ================= ADMIN LOGIN ================= */
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/login", {
        username: adminUser,
        password: adminPass,
      });

      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.container}>
        <img src="/bennett-logo.png" alt="Bennett Logo" style={styles.logo} />
        <h2 style={styles.title}>Bennett University</h2>

        {!isAdmin ? (
          <div style={styles.card}>
            <h3>🎓 Student Login</h3>

            <form onSubmit={handleStudentLogin}>
              <input
                type="email"
                placeholder="yourid@bennett.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />

              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={studentPass}
                  onChange={(e) => setStudentPass(e.target.value)}
                  required
                  style={styles.input}
                />
                <span
                  onClick={() => setShowPass(!showPass)}
                  style={styles.showBtn}
                >
                  {showPass ? "Hide" : "Show"}
                </span>
              </div>

              <label style={styles.remember}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember Me
              </label>

              <button style={styles.studentBtn}>Login as Student</button>
            </form>

            <button style={styles.switchBtn} onClick={() => setIsAdmin(true)}>
              Admin Login →
            </button>
          </div>
        ) : (
          <div style={{ ...styles.card, background: "#1e293b", color: "white" }}>
            <h3>🛡 Admin Login</h3>

            <form onSubmit={handleAdminLogin}>
              <input
                placeholder="Admin Username"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                required
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                required
                style={styles.input}
              />

              <button style={styles.adminBtn}>Login as Admin</button>
            </form>

            <button style={styles.switchBtn} onClick={() => setIsAdmin(false)}>
              ← Back to Student Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: "url('/bennett-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: "20px"
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(3px)"
  },
  container: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "420px",
    textAlign: "center"
  },
  logo: {
    width: "120px",
    marginBottom: "10px"
  },
  title: {
    color: "white",
    marginBottom: "15px"
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  remember: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px"
  },
  studentBtn: {
    width: "100%",
    padding: "12px",
    background: "#1e40af",
    color: "white",
    border: "none",
    borderRadius: "8px",
    marginTop: "10px",
    fontWeight: "600",
    cursor: "pointer"
  },
  adminBtn: {
    width: "100%",
    padding: "12px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    marginTop: "10px",
    fontWeight: "600",
    cursor: "pointer"
  },
  switchBtn: {
    marginTop: "15px",
    background: "transparent",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    fontWeight: "500"
  },
  showBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "12px",
    cursor: "pointer",
    color: "#2563eb"
  }
};
