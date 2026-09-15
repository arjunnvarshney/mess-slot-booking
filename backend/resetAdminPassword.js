const { text, password, check } = require("./lib/domain");
const Admin = require("./models/Admin");
require("./scripts/runScript")(async () => {
  const username = text(process.env.ADMIN_USERNAME, "ADMIN_USERNAME");
  const secret = password(process.env.ADMIN_PASSWORD);
  const admin = await Admin.findOne({ username }).select("+password");
  check(admin, "Administrator not found", 404);
  admin.password = secret;
  await admin.save();
  console.log("Administrator password updated; existing sessions revoked");
});
