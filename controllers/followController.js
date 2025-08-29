// controllers/followController.js
const User = require("../models/User");

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId, targetId } = req.body; // who follows who

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

    return res.json({ success: true, message: "Followed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Follow action failed" });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId, targetId } = req.body;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if not following
    if (!user.following.includes(targetId)) {
      return res.status(400).json({ success: false, message: "You are not following this user" });
    }

    // Remove from following/followers
    user.following = user.following.filter(id => id.toString() !== targetId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

    await user.save();
    await targetUser.save();

    return res.json({ success: true, message: "Unfollowed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Unfollow action failed" });
  }
};
