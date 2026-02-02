import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, tokenKey }) {
  const token = localStorage.getItem(tokenKey);

  if (!token) {
    return <Navigate to={tokenKey === "adminToken" ? "/admin/login" : "/student/login"} replace />;
  }

  return children;
}
