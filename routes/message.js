const express = require("express");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messaging endpoints
 */

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     summary: Send a message in a chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - text
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: ID of the chat
 *                 example: 64f3abcd1234567890
 *               text:
 *                 type: string
 *                 description: Message content
 *                 example: "Hello, is this still available?"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: chatId or text missing
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.post("/send", protect, async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const sender = req.user._id;

    if (!chatId || !text) {
      return res.status(400).json({ success: false, message: "chatId and text are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    const message = new Message({
      chat: chatId,
      sender,
      text,
    });

    await message.save();

    chat.lastMessage = text;
    await chat.save();

    const populatedMessage = await message.populate("sender", "name email");

    res.json({ success: true, message: populatedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @swagger
 * /api/messages/{chatId}:
 *   get:
 *     summary: Get all messages for a chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *         example: 64f3abcd1234567890
 *     responses:
 *       200:
 *         description: List of messages in the chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
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
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         chat:
 *           type: string
 *         sender:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         text:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
