// routes/followRoutes.js
const express = require("express");
const router = express.Router();
const { followUser, unfollowUser } = require("../controllers/followController");

/**
 * @swagger
 * tags:
 *   name: Follow
 *   description: Follow and unfollow users
 */

/**
 * @swagger
 * /api/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Follow]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - targetId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user who wants to follow
 *                 example: "64e23f2c5a12b34234abcd12"
 *               targetId:
 *                 type: string
 *                 description: ID of the user to be followed
 *                 example: "64e23f2c5a12b34234abcd34"
 *     responses:
 *       200:
 *         description: Followed successfully
 *       400:
 *         description: Already following this user or invalid request
 *       404:
 *         description: User not found
 *       500:
 *         description: Follow action failed
 */
router.post("/follow", followUser);

/**
 * @swagger
 * /api/unfollow:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Follow]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - targetId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user who wants to unfollow
 *                 example: "64e23f2c5a12b34234abcd12"
 *               targetId:
 *                 type: string
 *                 description: ID of the user to be unfollowed
 *                 example: "64e23f2c5a12b34234abcd34"
 *     responses:
 *       200:
 *         description: Unfollowed successfully
 *       400:
 *         description: You are not following this user
 *       404:
 *         description: User not found
 *       500:
 *         description: Unfollow action failed
 */
router.post("/unfollow", unfollowUser);

module.exports = router;
