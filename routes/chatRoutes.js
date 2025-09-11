const express = require("express");
const Chat = require("../models/Chat");
const Product = require("../models/Product");
const { protect } = require("../middlewares/authMiddleware");
const Message = require("../models/Message");
const checkDisabled = require("../middlewares/checkDisabled"); // 🚨 import

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat related endpoints
 */

/**
 * @swagger
 * /api/chat/init:
 *   post:
 *     summary: Initialize a chat between a user and seller by product ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product for which chat is initialized
 *                 example: 64f3abcd1234567890
 *     responses:
 *       200:
 *         description: Chat initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 chat:
 *                   $ref: '#/components/schemas/Chat'
 *                 seller:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     thumbnail:
 *                       type: string
 *                     price:
 *                       type: number
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Server error
 */
router.post("/init", protect, checkDisabled, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId).populate("poster", "name email _id");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const sellerId = product.poster._id;

    let chat = await Chat.findOne({
      product: productId,
      members: { $all: [userId, sellerId] },
    }).populate("members", "name email");

    if (!chat) {
      chat = new Chat({
        product: productId,
        members: [userId, sellerId],
      });
      await chat.save();
    }

    res.json({
      success: true,
      chat,
      seller: product.poster,
      product: {
        _id: product._id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         product:
 *           type: string
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *         lastMessage:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

// routes/chatRoutes.js


// ✅ Delete all messages in a chat
router.delete("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;

    // Delete messages for this chat
    await Message.deleteMany({ chat: chatId });

    // Optional: also delete chat record itself
    await Chat.findByIdAndDelete(chatId);

    res.json({ success: true, message: "Chat and messages deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
