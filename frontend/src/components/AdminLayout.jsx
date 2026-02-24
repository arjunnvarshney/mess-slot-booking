import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function AdminLayout() {
    const navigate = useNavigate();
    const { darkMode } = useContext(ThemeContext);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: darkMode ? "#0f172a" : "#f1f5f9"
        }}>
            <Sidebar onLogout={handleLogout} />
            <div style={{ flex: 1, overflowY: "auto" }}>
                <Outlet />
            </div>
        </div>
    );
}
