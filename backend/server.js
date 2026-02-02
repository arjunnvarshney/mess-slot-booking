require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const studentRoutes = require("./routes/studentRoutes");
const studentAuthRoutes = require("./routes/studentAuthRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const slotRoutes = require("./routes/slotRoutes");

const app = express();

connectDB();
app.use(cors());
app.use(express.json());

/* ================= ADMIN ROUTES ================= */
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin", require("./routes/adminStudentRoutes"));
app.use("/api/admin", require("./routes/adminSlotRoutes"));

/* ================= STUDENT ROUTES ================= */
app.use("/api/students", studentRoutes);
app.use("/api/students", studentAuthRoutes);

/* ================= OTHER ROUTES ================= */
app.use("/api/bookings", bookingRoutes);
app.use("/api/slots", slotRoutes);

app.get("/", (req, res) => {
  res.send("Mess Slot Booking Backend Running");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
