const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const connectDB = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const followRoutes = require("./routes/followRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/message");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api", followRoutes);

// Error handling middleware
app.use(require("./middlewares/errorMiddleware"));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // restrict in production
    methods: ["GET", "POST"],
  },
});

let onlineUsers = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Track online user
  socket.on("userOnline", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });

  // Join a chat room
  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined room ${chatId}`);
  });

  // Leave a chat room
  socket.on("leaveRoom", (chatId) => {
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left room ${chatId}`);
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ chatId, senderId, text }) => {
    try {
      const Message = require("./models/Message");
      const Chat = require("./models/Chat");

      // Save message in DB
      const message = new Message({ chat: chatId, sender: senderId, text });
      await message.save();

      // Update last message in chat
      await Chat.findByIdAndUpdate(chatId, { lastMessage: text });

      // Populate sender details
      const populatedMessage = await message.populate("sender", "name email");

      // Broadcast to everyone else in the room except sender
      socket.to(chatId).emit("newMessage", populatedMessage);
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

  // Typing indicator
  socket.on("typing", ({ chatId, senderId, isTyping }) => {
    socket.to(chatId).emit("typing", { chatId, senderId, isTyping });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    onlineUsers = Object.fromEntries(
      Object.entries(onlineUsers).filter(([key, value]) => value !== socket.id)
    );
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });
});

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
