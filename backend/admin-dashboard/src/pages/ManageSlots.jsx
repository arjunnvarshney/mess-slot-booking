import { useEffect, useState } from "react";
import api from "../services/api";

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    mealType: "breakfast",
    floor: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: ""
  });

  const fetchSlots = async () => {
    const res = await api.get("/admin/slots");
    setSlots(res.data);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await api.post("/admin/slots", form);
    fetchSlots();
  };

  const deleteSlot = async id => {
    await api.delete(`/admin/slots/${id}`);
    fetchSlots();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>🍽 Manage Meal Slots</h2>

      {/* CREATE SLOT FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <select name="mealType" onChange={handleChange}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>

        <input name="floor" placeholder="Floor" onChange={handleChange} required />
        <input type="date" name="date" onChange={handleChange} required />
        <input type="time" name="startTime" onChange={handleChange} required />
        <input type="time" name="endTime" onChange={handleChange} required />
        <input type="number" name="capacity" placeholder="Capacity" onChange={handleChange} required />

        <button type="submit">Add Slot</button>
      </form>

      {/* SLOT TABLE */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Meal</th>
            <th>Floor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Capacity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot._id}>
              <td>{slot.mealType}</td>
              <td>{slot.floor}</td>
              <td>{new Date(slot.date).toLocaleDateString()}</td>
              <td>{slot.startTime} - {slot.endTime}</td>
              <td>{slot.capacity}</td>
              <td>
                <button onClick={() => deleteSlot(slot._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
