import { useState } from "react";
import StudentLogin from "./StudentLogin";
import StudentDashboard from "./StudentDashboard";

export default function StudentApp() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("studentToken"));

  if (!loggedIn) return <StudentLogin onLogin={() => setLoggedIn(true)} />;
  return <StudentDashboard onLogout={() => setLoggedIn(false)} />;
}
