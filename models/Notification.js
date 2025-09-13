const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives the notification
    type: {
      type: String,
      enum: ["reset_password", "message", "admin", "follow"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for follow/message notifications
    relatedMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // for message notifications
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
