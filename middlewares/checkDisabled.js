// middlewares/checkDisabled.js
const User = require("../models/User");

const checkDisabled = async (req, res, next) => {
  try {
    const userId = req.user._id; // added from protect middleware (JWT)

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled. You cannot perform this action.",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = checkDisabled;
