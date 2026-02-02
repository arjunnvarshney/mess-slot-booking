import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

/* ================= ADMIN ================= */
import DailyAnalytics from "./pages/DailyAnalytics";
import Sidebar from "./components/Sidebar";
import ManageSlots from "./pages/ManageSlots";
import AdminBookings from "./pages/AdminBookings";
import AdminStudents from "./pages/AdminStudents";
import QRScanner from "./pages/QRScanner";
import AdminRoute from "./components/AdminRoute";

/* ================= STUDENT ================= */
import StudentDashboard from "./student/StudentDashboard";
import StudentRoute from "./components/StudentRoute";

/* ================= NEW UNIFIED LOGIN ================= */
import UnifiedLogin from "./pages/UnifiedLogin";

function AdminLayout() {
  const logout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/login"; // 🔥 unified login
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onLogout={logout} />
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= UNIFIED LOGIN ================= */}
        <Route path="/login" element={<UnifiedLogin />} />

        {/* ================= ADMIN PROTECTED ================= */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DailyAnalytics />} />
            <Route path="slots" element={<ManageSlots />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="scanner" element={<QRScanner />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Route>
        </Route>

        {/* ================= STUDENT PROTECTED ================= */}
        <Route element={<StudentRoute />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        {/* ================= DEFAULT REDIRECT ================= */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
