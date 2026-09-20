import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UnifiedLogin from "./pages/UnifiedLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminRoute from "./components/AdminRoute";
import StudentRoute from "./components/StudentRoute";
import ErrorBoundary from "./components/ErrorBoundary";
const StudentDashboard = lazy(() => import("./student/StudentDashboard"));
const DailyAnalytics = lazy(() => import("./pages/DailyAnalytics"));
const AdminBookings = lazy(() => import("./pages/AdminBookings"));
const AdminStudents = lazy(() => import("./pages/AdminStudents"));
const ManageSlots = lazy(() => import("./pages/ManageSlots"));
const QRScanner = lazy(() => import("./pages/QRScanner"));
const Settings = lazy(() => import("./pages/Settings"));
const ManageDining = lazy(() => import("./pages/ManageDining"));
const DemoDashboard = lazy(() => import("./pages/DemoDashboard"));
export default function App() {
  return (
    <ErrorBoundary>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Suspense
        fallback={
          <p className="main" role="status">
            Loading page…
          </p>
        }
      >
        <Routes>
          <Route path="/" element={<UnifiedLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/demo" element={<DemoDashboard />} />
          <Route element={<StudentRoute />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route
              path="/student/settings"
              element={<Settings role="student" />}
            />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DailyAnalytics />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="slots" element={<ManageSlots />} />
              <Route path="dining" element={<ManageDining />} />
              <Route path="scanner" element={<QRScanner />} />
              <Route path="settings" element={<Settings role="admin" />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
