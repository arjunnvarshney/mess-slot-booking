import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/admin/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Fetch students error:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const updateFloor = async (id, floor) => {
    try {
      await api.put(`/admin/students/${id}/floor`, { floor });
      fetchStudents();
    } catch (err) {
      console.error("Update floor error:", err);
    }
  };

  const filtered = students.filter(s =>
    s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/bennett-logo.png" alt="Logo" style={styles.headerLogo} />
          <h2 style={styles.title}>Admin Dashboard</h2>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.content}>
        <div style={styles.statsBar}>
          <div style={styles.statCard}>
            <h3>{students.length}</h3>
            <p>Total Students</p>
          </div>
          <div style={styles.statCard}>
            <h3>{students.filter(s => s.floor === 1).length}</h3>
            <p>Floor 1 Residents</p>
          </div>
          <div style={styles.statCard}>
            <h3>{students.filter(s => s.floor === 2).length}</h3>
            <p>Floor 2 Residents</p>
          </div>
        </div>

        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3>👨‍🎓 Student Management</h3>
            <input
              placeholder="🔍 Search by Name or Roll No"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Roll No</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Hostel</th>
                  <th style={styles.th}>Floor</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => (
                  <tr key={student._id} style={styles.tr}>
                    <td style={styles.td}>{student.rollNo}</td>
                    <td style={styles.td}>{student.name}</td>
                    <td style={styles.td}>{student.hostel}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusTag,
                        background: student.floor === 1 ? "#0f766e" : "#1e293b"
                      }}>
                        Floor {student.floor}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => updateFloor(student._id, 1)}
                        style={{ ...styles.actionBtn, background: "#0f766e" }}
                        disabled={student.floor === 1}
                      >
                        Set F1
                      </button>
                      <button
                        onClick={() => updateFloor(student._id, 2)}
                        style={{ ...styles.actionBtn, background: "#1e293b" }}
                        disabled={student.floor === 2}
                      >
                        Set F2
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f1f5f9",
    color: "#1e293b",
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    background: "#1e293b",
    color: "white",
    padding: "15px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  headerLogo: {
    height: "40px",
    filter: "brightness(0) invert(1)"
  },
  title: {
    fontSize: "20px",
    fontWeight: "600"
  },
  logoutBtn: {
    padding: "8px 20px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },
  content: {
    padding: "30px 40px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  tableCard: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    overflow: "hidden"
  },
  tableHeader: {
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px"
  },
  searchInput: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    width: "300px",
    outline: "none",
    fontSize: "14px"
  },
  tableWrapper: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
  },
  th: {
    padding: "15px 20px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "600"
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
    transition: "background 0.2s"
  },
  td: {
    padding: "15px 20px",
    fontSize: "14px"
  },
  statusTag: {
    padding: "4px 10px",
    borderRadius: "20px",
    color: "white",
    fontSize: "12px",
    fontWeight: "600"
  },
  actionBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    marginRight: "5px",
    opacity: 1,
    transition: "opacity 0.2s"
  }
};
