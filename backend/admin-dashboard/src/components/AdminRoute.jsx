import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const token = localStorage.getItem("adminToken");

  // If no token → go to login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // If token exists → allow access
  return <Outlet />;
}
