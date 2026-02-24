import { Routes, Route, Navigate } from "react-router-dom";
import UnifiedLogin from "./pages/UnifiedLogin";
import StudentDashboard from "./student/StudentDashboard";

import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminRoute from "./components/AdminRoute";

/* Admin Pages */
import DailyAnalytics from "./pages/DailyAnalytics";
import AdminBookings from "./pages/AdminBookings";
import AdminStudents from "./pages/AdminStudents";
import ManageSlots from "./pages/ManageSlots";
import QRScanner from "./pages/QRScanner";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UnifiedLogin />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* PROTECTED ADMIN ROUTES */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DailyAnalytics />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="slots" element={<ManageSlots />} />
          <Route path="scanner" element={<QRScanner />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>
      </Route>

      {/* Redirect all unknown to login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
