// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

// 🔑 helper - generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 📧 helper - create nodemailer transporter
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// 📧 helper - send OTP email
const sendOtpEmail = async (to, otp) => {
  const transporter = createTransporter();

  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Verify Your Email</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 0; margin: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <tr>
        <td style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Solution Market Arena</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #111827; font-size: 20px; margin-bottom: 15px;">Verify Your Email Address</h2>
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            Welcome! To complete your registration, please use the OTP code below:
          </p>
          <p style="margin: 30px 0;">
            <span style="font-size: 28px; font-weight: bold; color: #4F46E5; letter-spacing: 4px;">${otp}</span>
          </p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            If you didn’t request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6B7280;">
          &copy; ${new Date().getFullYear()} Solution Market Arena. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"Solution Market Arena" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email - OTP Code",
    html: htmlTemplate,
  });
};


// 📝 Register (signup)
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, businessName } = req.body;

    if (!firstName || !lastName || !email || !password || !businessName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 min

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      businessName,
      otp,
      otpExpires,
      isVerified: false,
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.error("❌ OTP email error:", emailErr);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered, OTP sent to email",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: user.businessName,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: user.businessName,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔑 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Block unverified
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your account first" });
    }

    // 🚨 Block disabled accounts
    // if (user.isDisabled) {
    //   return res.status(403).json({ message: "Your account has been disabled. Please contact support." });
    // }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: user.businessName,
        isDisabled: user.isDisabled, // include flag
      },
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// 🔁 Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: "OTP resent successfully. Please check your email." });
  } catch (error) {
    console.error("❌ Resend OTP Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp'); // exclude sensitive fields
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// GET seller profile
exports.getSellerProfile = async (req, res) => {
  try {
    const { sellerId, currentUserId } = req.query;

    const seller = await User.findById(sellerId).select("businessName createdAt");

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    // Count stats
    const listingsCount = await Listing.countDocuments({ seller: sellerId });
    const soldCount = await Listing.countDocuments({ seller: sellerId, status: "sold" });
    const followersCount = seller.followers.length;
    const followingCount = seller.following.length;

    // Check if current user is following this seller
    const isFollowing = seller.followers.includes(currentUserId);

    return res.json({
      success: true,
      data: {
        seller,
        stats: {
          listings: listingsCount,
          sold: soldCount,
          followers: followersCount,
          following: followingCount
        },
        isFollowing
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch seller profile" });
  }
};

// Delete user + products
// ✅ Delete user and all their products
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // Ensure only the account owner or admin can delete
    if (req.user._id.toString() !== id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete all products posted by this user
    await Product.deleteMany({ poster: user._id });

    // Delete the user
    await user.deleteOne();

    return res.json({ success: true, message: "User and products deleted" });
  } catch (err) {
    console.error("❌ deleteUser error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// 🔑 Forgot Password
// =============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP & set expiry (10 min)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send OTP to email
    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email address",
    });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// 🔑 Reset Password
// =============================


exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash and update password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    // Clear OTP fields if any exist
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    // ✅ Create notification
    await Notification.create({
      user: user._id,
      type: "security",
      title: "Password Reset Successful 🎉",
      message: "Your password has been changed. If this wasn’t you, please secure your account immediately.",
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================
// 🔁 Resend OTP for Reset Password
// =============================
exports.resendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // valid for 10 min
    await user.save();

    // Send OTP via email
    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("❌ Resend Reset OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
