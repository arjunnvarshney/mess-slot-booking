const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    action: { type: String, required: true },
    target: String,
    details: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);
schema.index({ createdAt: -1 });
module.exports = mongoose.models.AuditLog || mongoose.model("AuditLog", schema);
