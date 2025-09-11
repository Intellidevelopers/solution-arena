// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Block user
router.post("/:userId/block/:blockId", async (req, res) => {
  try {
    const { userId, blockId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.blockedUsers.includes(blockId)) {
      user.blockedUsers.push(blockId);
      await user.save();
    }

    res.json({ success: true, message: "User blocked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Unblock user
router.post("/:userId/unblock/:blockId", async (req, res) => {
  try {
    const { userId, blockId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== blockId
    );
    await user.save();

    res.json({ success: true, message: "User unblocked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
