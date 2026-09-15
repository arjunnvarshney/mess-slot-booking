import { Navigate, Outlet } from "react-router-dom";
import { tokenFor } from "../services/session";
export default function StudentRoute() {
  return tokenFor("student") ? <Outlet /> : <Navigate to="/" replace />;
}
