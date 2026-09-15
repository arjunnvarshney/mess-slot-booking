const { text, password } = require("./lib/domain");
const Admin = require("./models/Admin");
require("./scripts/runScript")(async () => {
  const username = text(process.env.ADMIN_USERNAME, "ADMIN_USERNAME");
  const secret = password(process.env.ADMIN_PASSWORD);
  if (await Admin.exists({ username })) {
    console.log("Administrator already exists; no changes made");
    return;
  }
  await Admin.create({ username, password: secret });
  console.log("Administrator created");
});
