import { useState } from "react";
import api from "../services/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/admin/login", {
        username,
        password,
      });

      console.log("✅ LOGIN SUCCESS RESPONSE:", res.data);

      // Save token
      localStorage.setItem("adminToken", res.data.token);

      // Tell App we are logged in
      onLogin();

    } catch (err) {
      console.log("❌ LOGIN ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "40px",
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      color: "white"
    }}>
      <h2>Admin Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
        />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
        />
        <br />

        <button
          type="submit"
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer"
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
