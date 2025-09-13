// controllers/followController.js
const User = require("../models/User");
const Notification = require("../models/Notification");


// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId, targetId } = req.body; // who follows who

    if (!userId || !targetId) {
      return res.status(400).json({ success: false, message: "userId and targetId are required" });
    }

    if (userId === targetId) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if already following
    if (user.following.includes(targetId)) {
      return res.status(400).json({ success: false, message: "Already following this user" });
    }

    // Update both users
    user.following.push(targetId);
    targetUser.followers.push(userId);

    await user.save();
    await targetUser.save();

    // ✅ Create follow notification for target user
    await Notification.create({
      user: targetId, // the one receiving the notification
      type: "follow",
      title: "New Follower",
      message: `${user.firstName} ${user.lastName} started following you.`,
      relatedUser: userId, // so frontend can show profile link
    });

    return res.json({ success: true, message: "Followed successfully" });
  } catch (error) {
    console.error("❌ Follow Error:", error.message, error.stack);
    return res.status(500).json({ success: false, message: error.message });
  }
};



// Unfollow a user
// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId, targetId } = req.body;

    if (!userId || !targetId) {
      return res.status(400).json({ success: false, message: "userId and targetId are required" });
    }

    if (userId === targetId) {
      return res.status(400).json({ success: false, message: "You cannot unfollow yourself" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user is actually following
    if (!user.following.includes(targetId)) {
      return res.status(400).json({ success: false, message: "You are not following this user" });
    }

    // Remove from following and followers
    user.following = user.following.filter(id => id.toString() !== targetId.toString());
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId.toString());

    await user.save();
    await targetUser.save();

    return res.json({ success: true, message: "Unfollowed successfully" });
  } catch (error) {
    console.error("❌ Unfollow Error:", error.message, error.stack);
    return res.status(500).json({ success: false, message: error.message });
  }
};
