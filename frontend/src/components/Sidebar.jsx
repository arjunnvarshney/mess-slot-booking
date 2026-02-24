import { NavLink } from "react-router-dom";
import {
    FaChartBar,
    FaCalendarAlt,
    FaUsers,
    FaSignOutAlt,
    FaBars,
    FaMoon,
    FaSun,
    FaUtensils,
    FaQrcode
} from "react-icons/fa";
import { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function Sidebar({ onLogout }) {
    const [collapsed, setCollapsed] = useState(false);
    const { darkMode, toggleTheme } = useContext(ThemeContext);

    const linkBase = {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 15px",
        borderRadius: "8px",
        marginBottom: "10px",
        textDecoration: "none",
        color: "#cbd5e1"
    };

    const activeStyle = {
        background: "#1e293b",
        color: "white"
    };

    return (
        <div style={{
            width: collapsed ? "80px" : "240px",
            background: "#0f172a",
            padding: "20px 10px",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.3s ease",
            minHeight: "100vh"
        }}>
            <FaBars
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    color: "white",
                    cursor: "pointer",
                    marginBottom: "20px",
                    alignSelf: collapsed ? "center" : "flex-end"
                }}
            />

            {!collapsed && (
                <h2 style={{ color: "white", textAlign: "center", marginBottom: "25px", fontSize: "1.2rem" }}>
                    🍽 Mess Admin
                </h2>
            )}

            <NavLink to="/admin/dashboard" style={({ isActive }) =>
                isActive ? { ...linkBase, ...activeStyle } : linkBase}>
                <FaChartBar /> {!collapsed && "Dashboard"}
            </NavLink>

            <NavLink to="/admin/bookings" style={({ isActive }) =>
                isActive ? { ...linkBase, ...activeStyle } : linkBase}>
                <FaCalendarAlt /> {!collapsed && "Bookings"}
            </NavLink>

            <NavLink to="/admin/students" style={({ isActive }) =>
                isActive ? { ...linkBase, ...activeStyle } : linkBase}>
                <FaUsers /> {!collapsed && "Students"}
            </NavLink>

            <NavLink to="/admin/slots" style={({ isActive }) =>
                isActive ? { ...linkBase, ...activeStyle } : linkBase}>
                <FaUtensils /> {!collapsed && "Manage Slots"}
            </NavLink>

            <NavLink to="/admin/scanner" style={({ isActive }) =>
                isActive ? { ...linkBase, ...activeStyle } : linkBase}>
                <FaQrcode /> {!collapsed && "QR Scanner"}
            </NavLink>

            <button onClick={toggleTheme} style={{
                marginTop: "auto",
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: "#1e293b",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: "10px"
            }}>
                {darkMode ? <FaSun /> : <FaMoon />}
                {!collapsed && (darkMode ? "Light Mode" : "Dark Mode")}
            </button>

            <button onClick={onLogout} style={{
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: "#dc2626",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: "10px"
            }}>
                <FaSignOutAlt /> {!collapsed && "Logout"}
            </button>
        </div>
    );
}
