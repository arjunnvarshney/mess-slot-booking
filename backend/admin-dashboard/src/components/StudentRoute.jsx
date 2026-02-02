import { Navigate, Outlet } from "react-router-dom";

export default function StudentRoute() {
  const token = localStorage.getItem("studentToken");
  return token ? <Outlet /> : <Navigate to="/student/login" />;
}
