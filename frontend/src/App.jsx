import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UnifiedLogin from "./pages/UnifiedLogin";

// Temporary placeholders (so navigation works)
function StudentDashboard() {
  return <h1 style={{ color: "white" }}>Student Dashboard Loaded ✅</h1>;
}

function AdminLogin() {
  return <h1 style={{ color: "white" }}>Admin Login Page Loaded ✅</h1>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UnifiedLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
