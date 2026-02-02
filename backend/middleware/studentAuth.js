const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find student
    const student = await Student.findById(decoded.studentId).select("-password");
    if (!student) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Attach student to request
    req.student = student;
    next();

  } catch (err) {
    console.error("Student auth error:", err.message);
    res.status(401).json({ error: "Token is not valid" });
  }
};
