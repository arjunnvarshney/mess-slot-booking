import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UnifiedLogin from "./pages/UnifiedLogin";

// Temporary placeholders (so navigation works)
import StudentDashboard from "./student/StudentDashboard";

function AdminLogin() {
  return <h1 style={{ color: "white" }}>Admin Login Page Loaded ✅</h1>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<UnifiedLogin />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  );
}

export default App;
