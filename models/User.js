const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    businessName: { type: String, required: true },

    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },

    isDisabled: { type: Boolean, default: false },

    // Followers & Following
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Virtual field to check if current user is blocked by another user
userSchema.virtual("isBlocked").get(function () {
  // `this._blockedBy` should be set manually when fetching user if needed
  return !!this._blockedBy;
});

module.exports = mongoose.model("User", userSchema);
