const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const Product = require("../models/Product");
const User = require("../models/User");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and User Management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - businessName
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               businessName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered, OTP sent
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and activate user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post("/verify-otp", authController.verifyOtp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully
 */
router.post("/resend-otp", authController.resendOTP);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get("/profile", protect, authController.getProfile);

/**
 * @swagger
 * /auth/user-profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get("/:sellerId/profile", protect, authController.getSellerProfile);


/**
 * @swagger
 * /auth/{sellerId}/stats:
 *   get:
 *     summary: Get seller stats (listings, sold, followers, following)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         schema:
 *           type: string
 *         required: true
 *         description: Seller ID
 */
// GET seller stats + isFollowing
router.get("/:sellerId/stats", protect, async (req, res) => {
  try {
    const { sellerId } = req.params;

    // count listings and sold
    const listings = await Product.countDocuments({ poster: sellerId });
    const sold = await Product.countDocuments({ poster: sellerId, status: "sold" });

    // get seller info
    const seller = await User.findById(sellerId).populate("followers following", "_id");

    // check if logged-in user follows this seller
    const isFollowing = seller.followers.some(
      (f) => f._id.toString() === req.user.id
    );

    res.json({
      success: true,
      data: {
        seller: {
          _id: seller._id,
          businessName: seller.businessName,
          createdAt: seller.createdAt,
        },
        stats: {
          listings,
          sold,
          followers: seller.followers.length,
          following: seller.following.length,
        },
        isFollowing, // 👈 added this
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

module.exports = router;
