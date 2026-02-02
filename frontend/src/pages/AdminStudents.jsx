import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    const res = await api.get("/admin/students");
    setStudents(res.data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const updateFloor = async (id, floor) => {
    await api.put(`/admin/students/${id}/floor`, { floor });
    fetchStudents();
  };

  const filtered = students.filter(s =>
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h2>👨‍🎓 Student Management</h2>

      <input
        placeholder="Search by Roll No"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          padding: "8px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "none"
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#1e293b" }}>
            <th style={th}>Roll No</th>
            <th style={th}>Name</th>
            <th style={th}>Hostel</th>
            <th style={th}>Floor</th>
            <th style={th}>Change Floor</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(student => (
            <tr key={student._id} style={{ borderBottom: "1px solid #334155" }}>
              <td style={td}>{student.rollNo}</td>
              <td style={td}>{student.name}</td>
              <td style={td}>{student.hostel}</td>
              <td style={td}>{student.floor}</td>
              <td style={td}>
                <button onClick={() => updateFloor(student._id, 1)} style={btn}>
                  Floor 1
                </button>
                <button onClick={() => updateFloor(student._id, 2)} style={btn}>
                  Floor 2
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: "10px", textAlign: "left" };
const td = { padding: "10px" };
const btn = {
  marginRight: "8px",
  padding: "5px 10px",
  background: "#2563eb",
  border: "none",
  borderRadius: "5px",
  color: "white",
  cursor: "pointer"
};
