import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await api.get("/admin/students");
    setStudents(res.data);
  };

  const updateFloor = async (id, floor) => {
    await api.put(`/admin/students/${id}/floor`, { floor });
    fetchStudents();
  };

  return (
    <div>
      <h2>👨‍🎓 Student Management</h2>

      <table style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll No</th>
            <th>Current Floor</th>
            <th>Change Floor</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.rollNo}</td>
              <td>{s.floor}</td>
              <td>
                <button onClick={() => updateFloor(s._id, 1)}>Floor 1</button>
                <button onClick={() => updateFloor(s._id, 2)}>Floor 2</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
