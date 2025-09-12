const mongoose = require("mongoose");
const Product = require("./Product"); // import your Product model

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

// ✅ Virtual field
userSchema.virtual("isBlocked").get(function () {
  return !!this._blockedBy;
});

// ✅ Middleware: When a user is deleted, also delete their products
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const userId = this.getQuery()._id;
    if (userId) {
      await Product.deleteMany({ user: userId });
      console.log(`✅ Deleted all products for user ${userId}`);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Also handle if deleteOne is used
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    await Product.deleteMany({ user: this._id });
    console.log(`✅ Deleted all products for user ${this._id}`);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
