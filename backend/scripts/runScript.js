const path = require("node:path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
module.exports = async function runScript(action) {
  try {
    await require("../config/db")();
    await action();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};
