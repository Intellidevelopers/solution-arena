const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

// Create a notification
router.post("/", protect, notificationController.createNotification);

// Get all notifications for a user
router.get("/:userId", protect, notificationController.getNotifications);

// Mark as read
router.put("/:id/read", protect, notificationController.markAsRead);

module.exports = router;
