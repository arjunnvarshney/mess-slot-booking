const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { text, check } = require("../lib/domain");
async function login(Model, field, body, role) {
  let identifier = text(body[field], field);
  if (field === "rollNo") identifier = identifier.toUpperCase();
  check(
    typeof body.password === "string" &&
      body.password.length > 0 &&
      Buffer.byteLength(body.password) <= 72,
    "Password is required",
  );
  const user = await Model.findOne({ [field]: identifier }).select("+password");
  check(
    user &&
      user.active !== false &&
      (await bcrypt.compare(body.password, user.password)),
    "Invalid credentials",
    401,
  );
  return jwt.sign(
    { role, version: user.authVersion || 0 },
    process.env.JWT_SECRET,
    {
      subject: String(user._id),
      algorithm: "HS256",
      expiresIn: role === "admin" ? "8h" : "1d",
    },
  );
}
module.exports = { login };
