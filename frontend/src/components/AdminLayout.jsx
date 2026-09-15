import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <main id="main-content" className="main">
        <Outlet />
      </main>
    </div>
  );
}
