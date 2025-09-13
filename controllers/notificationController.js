const Notification = require("../models/Notification");

// ➕ Create a notification
exports.createNotification = async (req, res) => {
  try {
    const { user, type, title, message, relatedUser, relatedMessage } = req.body;

    if (!user || !type || !title || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      relatedUser,
      relatedMessage,
    });

    return res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error("❌ Create Notification Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 📥 Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ user: userId })
      .populate("relatedUser", "firstName lastName email")
      .populate("relatedMessage", "text")
      .sort({ createdAt: -1 });

    return res.json({ success: true, notifications });
  } catch (err) {
    console.error("❌ Get Notifications Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.json({ success: true, notification });
  } catch (err) {
    console.error("❌ Mark As Read Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
