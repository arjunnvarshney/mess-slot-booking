const { password, check } = require("../lib/domain");
const Student = require("../models/Student");
require("./runScript")(async () => {
  check(
    process.env.NODE_ENV !== "production" &&
      process.env.ALLOW_DEMO_SEED === "true",
    "Demo seed requires a non-production environment and ALLOW_DEMO_SEED=true",
  );
  const secret = password(process.env.DEMO_STUDENT_PASSWORD);
  if (await Student.exists({ rollNo: "DEMO123" })) {
    console.log("Demo account already exists; no changes made");
    return;
  }
  await Student.create({
    rollNo: "DEMO123",
    name: "Demo Student",
    hostel: "Demo Hostel",
    floor: 1,
    password: secret,
  });
  console.log("Demo student created");
});
