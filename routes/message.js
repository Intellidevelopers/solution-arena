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
      read: false,
    });

    await message.save();

    chat.lastMessage = text;
    await chat.save();

    const populatedMessage = await message.populate("sender", "_id name email");

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
      .populate("sender", "_id name email")
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

// add swagger doc
// Get all chats for a user with last message and product info

/**
 * @swagger
 * /api/message/user/{userId}:
 *   get:
 *     summary: Get all chats for a user
 *     description: Fetch all chats for a specific user, including the last message, product info, and the seller (the other chat member).
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose chats you want to retrieve
 *     responses:
 *       200:
 *         description: List of user chats with last message, seller, and product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 chats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "68b25cb953efd2d2648b2eb1"
 *                       chat:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "68b25cb953efd2d2648b2eb1"
 *                           product:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "68b24f34d4c5c0a7bd08ec10"
 *                               title:
 *                                 type: string
 *                                 example: "Camry Muscle 2008"
 *                               thumbnail:
 *                                 type: string
 *                                 example: "https://res.cloudinary.com/.../image.jpg"
 *                               price:
 *                                 type: number
 *                                 example: 6000000
 *                           members:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: "68a633436e19f96d2c496b98"
 *                                 name:
 *                                   type: string
 *                                   example: "Josiah Adeagbo"
 *                                 email:
 *                                   type: string
 *                                   example: "adeagbojosiah1@gmail.com"
 *                       seller:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "68b24e31d4c5c0a7bd08ebee"
 *                           name:
 *                             type: string
 *                             example: "Speed Afhost"
 *                           email:
 *                             type: string
 *                             example: "speedafhost@gmail.com"
 *                       product:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "68b24f34d4c5c0a7bd08ec10"
 *                           title:
 *                             type: string
 *                             example: "Camry Muscle 2008"
 *                           thumbnail:
 *                             type: string
 *                             example: "https://res.cloudinary.com/.../image.jpg"
 *                           price:
 *                             type: number
 *                             example: 6000000
 *                       lastMessage:
 *                         type: string
 *                         example: "Hello, is this still available?"
 *                       unread:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized, invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not authorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ members: userId })
      .populate("members", "name email")
      .populate("product", "title thumbnail price");

    const chatWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessageDoc = await Message.findOne({ chat: chat._id })
          .sort({ createdAt: -1 })
          .populate("sender", "_id name email");

        const seller = chat.members.find((m) => m._id.toString() !== userId);

        return {
          _id: chat._id,
          chat,
          seller,
          product: chat.product,
          lastMessage: lastMessageDoc ? lastMessageDoc.text : "",
          unread:
            lastMessageDoc &&
            !lastMessageDoc.read &&
            lastMessageDoc.sender._id.toString() !== userId,
        };
      })
    );

    res.json({ success: true, chats: chatWithLastMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
