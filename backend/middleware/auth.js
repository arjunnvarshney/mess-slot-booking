const jwt = require("jsonwebtoken");
const { HttpError } = require("../lib/domain");
module.exports = (Model, role) => async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return next(new HttpError(401, "Please log in"));
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return next(new HttpError(401, "Session expired. Please log in again"));
  }
  if (decoded.role !== role || typeof decoded.sub !== "string")
    return next(new HttpError(401, "Invalid session"));
  try {
    const user = await Model.findById(decoded.sub);
    if (
      !user ||
      user.active === false ||
      (user.authVersion || 0) !== decoded.version
    )
      return next(new HttpError(401, "Session expired. Please log in again"));
    req[role] = user;
    next();
  } catch (error) {
    next(error);
  }
};
