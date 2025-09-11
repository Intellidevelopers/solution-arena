const express = require("express");
const router = express.Router();
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to validate and convert ID
const toObjectId = (id) => {
  if (!id) return null;
  try {
    return new mongoose.Types.ObjectId(id); // ✅ Use 'new' with ObjectId
  } catch (err) {
    return null;
  }
};

// ✅ Block user
router.post("/:userId/block/:blockId", async (req, res) => {
  try {
    const userId = toObjectId(req.params.userId);
    const blockId = toObjectId(req.params.blockId);

    if (!userId || !blockId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { blockedUsers: blockId } },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, message: "User blocked", blockedUsers: user.blockedUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Unblock user
router.post("/:userId/unblock/:blockId", async (req, res) => {
  try {
    const userId = toObjectId(req.params.userId);
    const blockId = toObjectId(req.params.blockId);

    if (!userId || !blockId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== blockId.toString()
    );
    await user.save();

    res.json({ success: true, message: "User unblocked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Check if a user is blocked by logged-in user
router.get("/:loggedInUserId/isBlocked/:userId", async (req, res) => {
  try {
    const loggedInUserId = toObjectId(req.params.loggedInUserId);
    const userId = toObjectId(req.params.userId);

    if (!loggedInUserId || !userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) return res.status(404).json({ message: "User not found" });

    const isBlocked = loggedInUser.blockedUsers.some(
      (id) => id.toString() === userId.toString()
    );

    res.json({ success: true, isBlocked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
