const mongoose = require("mongoose");
const Product = require("./Product"); // import Product model safely

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

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Virtual
userSchema.virtual("isBlocked").get(function () {
  return !!this._blockedBy;
});

// 🔥 Middleware to delete products when a user is removed via Mongoose
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const userId = this.getQuery()._id;
    if (userId) {
      await Product.deleteMany({ poster: userId });
      console.log(`✅ Deleted all products for user ${userId}`);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Also handle `deleteOne()` called directly on document
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    await Product.deleteMany({ poster: this._id });
    console.log(`✅ Deleted all products for user ${this._id}`);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔁 Change stream to handle direct MongoDB deletions
mongoose.connection.once("open", () => {
  const userCollection = mongoose.connection.collection("users");

  const changeStream = userCollection.watch([{ $match: { operationType: "delete" } }]);

  changeStream.on("change", async (change) => {
    try {
      const deletedUserId = change.documentKey._id;
      console.log(`🗑 User deleted directly: ${deletedUserId}, deleting products...`);
      await Product.deleteMany({ poster: deletedUserId });
      console.log(`✅ Deleted all products for user ${deletedUserId}`);
    } catch (err) {
      console.error("❌ Error deleting products for deleted user:", err);
    }
  });
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
