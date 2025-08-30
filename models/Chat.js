const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
