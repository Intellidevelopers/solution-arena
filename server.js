// server.js (or index.js)
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
const socketHelper = require("./socket"); // <--- new

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const followRoutes = require("./routes/followRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/message");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


dotenv.config();
connectDB();
// console.log(process.env)

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

// Routes (register routes BEFORE socket init is OK - routes will call socketHelper.getIO() inside handlers)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api", followRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notification", notificationRoutes);


// Error handling
app.use(require("./middlewares/errorMiddleware"));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// initialize socket.io using helper
const io = socketHelper.init(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }, // lock down in production
});

let onlineUsers = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // track online user
  socket.on("userOnline", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });

  // join/leave room
  socket.on("joinRoom", (chatId) => {
    socket.join(String(chatId));
    console.log(`Socket ${socket.id} joined room ${chatId}`);
  });

  socket.on("leaveRoom", (chatId) => {
    socket.leave(String(chatId));
    console.log(`Socket ${socket.id} left room ${chatId}`);
  });

  // typing indicator (broadcast to room except sender)
  socket.on("typing", ({ chatId, senderId, isTyping }) => {
    socket.to(String(chatId)).emit("typing", { chatId, senderId, isTyping });
  });

  // In your server
socket.on("sendMessage", async ({ chatId, senderId, text }) => {
  try {
    const Message = require("./models/Message");
    const Chat = require("./models/Chat");

    const message = new Message({ chat: chatId, sender: senderId, text });
    await message.save();

    await Chat.findByIdAndUpdate(chatId, { lastMessage: text });

    const populatedMessage = await message.populate("sender", "name email");

    // Emit to everyone in the room (including sender)
    io.to(chatId).emit("newMessage", populatedMessage);
  } catch (err) {
    console.error(err);
  }
});


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    onlineUsers = Object.fromEntries(
      Object.entries(onlineUsers).filter(([key, value]) => value !== socket.id)
    );
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
