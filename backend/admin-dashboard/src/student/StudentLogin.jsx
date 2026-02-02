import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function StudentLogin() {
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/students/login", {
        rollNo,
        password,
      });

      localStorage.setItem("studentToken", res.data.token);
      navigate("/student/dashboard");

    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>🎓 Student Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Roll Number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
