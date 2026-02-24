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
        try {
            const res = await api.get("/admin/slots");
            setSlots(res.data);
        } catch (err) {
            console.error("Failed to fetch slots", err);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post("/admin/slots", form);
            fetchSlots();
        } catch (err) {
            alert("Error adding slot: " + (err.response?.data?.error || err.message));
        }
    };

    const deleteSlot = async id => {
        if (window.confirm("Delete this slot?")) {
            await api.delete(`/admin/slots/${id}`);
            fetchSlots();
        }
    };

    return (
        <div style={{ padding: "30px" }}>
            <h2>🍽 Manage Meal Slots</h2>

            {/* CREATE SLOT FORM */}
            <form onSubmit={handleSubmit} style={styles.form}>
                <select name="mealType" onChange={handleChange} style={styles.input}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                </select>

                <input name="floor" placeholder="Floor" onChange={handleChange} required style={styles.input} />
                <input type="date" name="date" onChange={handleChange} required style={styles.input} />
                <input type="time" name="startTime" onChange={handleChange} required style={styles.input} />
                <input type="time" name="endTime" onChange={handleChange} required style={styles.input} />
                <input type="number" name="capacity" placeholder="Capacity" onChange={handleChange} required style={styles.input} />

                <button type="submit" style={styles.addBtn}>Add Slot</button>
            </form>

            {/* SLOT TABLE */}
            <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                    <thead>
                        <tr style={{ background: "#1e293b", color: "white" }}>
                            <th style={styles.th}>Meal</th>
                            <th style={styles.th}>Floor</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Time</th>
                            <th style={styles.th}>Capacity</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slots.map(slot => (
                            <tr key={slot._id} style={{ borderBottom: "1px solid #334155" }}>
                                <td style={styles.td}>{slot.mealType}</td>
                                <td style={styles.td}>{slot.floor}</td>
                                <td style={styles.td}>{new Date(slot.date).toLocaleDateString()}</td>
                                <td style={styles.td}>{slot.startTime} - {slot.endTime}</td>
                                <td style={styles.td}>{slot.capacity}</td>
                                <td style={styles.td}>
                                    <button onClick={() => deleteSlot(slot._id)} style={styles.delBtn}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    form: {
        background: "#1e293b",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "30px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px"
    },
    input: {
        padding: "10px",
        borderRadius: "5px",
        border: "none",
        flex: "1",
        minWidth: "150px"
    },
    addBtn: {
        padding: "10px 20px",
        background: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "600"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    th: { padding: "12px", textAlign: "left" },
    td: { padding: "10px" },
    delBtn: {
        background: "#dc2626",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "4px",
        cursor: "pointer"
    }
};
