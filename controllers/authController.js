// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

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
  await transporter.sendMail({
    from: `"Solution Arena" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
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

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || !user.otpExpires || user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
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
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔑 Login
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