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
router.get("/:sellerId/stats", async (req, res) => {
  try {
    const { sellerId } = req.params;

    const listings = await Product.countDocuments({ poster: sellerId });
    const sold = await Product.countDocuments({
      poster: sellerId,
      status: "sold",
    });

    const seller = await User.findById(sellerId).populate(
      "followers following",
      "_id"
    );

    res.json({
      success: true,
      data: {
        listings,
        sold,
        followers: seller.followers.length,
        following: seller.following.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

module.exports = router;
