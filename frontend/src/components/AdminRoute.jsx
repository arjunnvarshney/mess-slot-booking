import { Navigate, Outlet } from "react-router-dom";
import { tokenFor } from "../services/session";
export default function AdminRoute() {
  return tokenFor("admin") ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace />
  );
}
