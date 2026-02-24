import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/admin/login", {
                username,
                password
            });

            localStorage.removeItem("studentToken");
            localStorage.setItem("adminToken", res.data.token);
            // Assuming you have an admin dashboard at /admin/dashboard
            navigate("/admin/dashboard");

        } catch (err) {
            console.error("Admin Login error:", err.response?.data || err.message);
            setError(err.response?.data?.error || "Invalid admin credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.overlay}></div>

            <div style={styles.card}>
                <img src="/bennett-logo.png" alt="Bennett Logo" style={styles.logo} />

                <h2 style={{ marginBottom: "5px" }}>Bennett University</h2>
                <p style={{ opacity: 0.7, marginBottom: "20px" }}>Admin / Mess Committee Login</p>

                <form onSubmit={handleAdminLogin}>
                    <input
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        {loading ? "Logging in..." : "Login as Admin"}
                    </button>
                </form>

                <hr style={{ margin: "20px 0", opacity: 0.3 }} />

                <button
                    style={styles.backBtn}
                    onClick={() => navigate("/")}
                >
                    ← Back to Student Login
                </button>
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
        position: "relative"
    },
    overlay: {
        position: "absolute",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)"
    },
    card: {
        position: "relative",
        zIndex: 2,
        width: "360px",
        background: "rgba(255,255,255,0.97)",
        padding: "35px 30px",
        borderRadius: "14px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        textAlign: "center"
    },
    logo: {
        width: "120px",
        marginBottom: "10px"
    },
    input: {
        width: "100%",
        padding: "12px",
        marginTop: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "14px",
        outline: "none"
    },
    loginBtn: {
        width: "100%",
        marginTop: "20px",
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        background: "#1e293b",
        color: "white",
        cursor: "pointer",
        fontWeight: "600",
        transition: "background 0.3s"
    },
    backBtn: {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #1e293b",
        background: "transparent",
        color: "#1e293b",
        cursor: "pointer",
        fontWeight: "500"
    },
    error: {
        color: "#dc2626",
        fontSize: "13px",
        marginTop: "12px"
    }
};
