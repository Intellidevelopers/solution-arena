// models/Report.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: String,
  status: { type: String, enum: ["pending", "reviewed"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
