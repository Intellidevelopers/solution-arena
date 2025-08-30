const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const connectDB = require('./config/db');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger"); // import config
const bodyParser = require("body-parser");
const http = require('http');
const { Server } = require('socket.io');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
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
app.use(morgan('dev'));
app.use(cookieParser());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/category', categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api", followRoutes);

// Error handling middleware
app.use(require('./middlewares/errorMiddleware'));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // restrict this in production
    methods: ["GET", "POST"]
  }
});

// Keep track of online users
let onlineUsers = {};

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User comes online
  socket.on('userOnline', (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit('onlineUsers', Object.keys(onlineUsers));
  });

  // User sends a message
  socket.on('sendMessage', ({ chatId, senderId, text }) => {
    const message = { chatId, senderId, text, createdAt: new Date() };
    
    // Emit to other users in the chat
    const receiverSocketId = Object.values(onlineUsers).find(id => id !== socket.id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', message);
    }

    // Optionally save message to DB here
  });

  // Typing indicator
  socket.on('typing', ({ chatId, senderId, isTyping }) => {
    socket.broadcast.emit('typing', { chatId, senderId, isTyping });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    onlineUsers = Object.fromEntries(
      Object.entries(onlineUsers).filter(([key, value]) => value !== socket.id)
    );
    io.emit('onlineUsers', Object.keys(onlineUsers));
  });
});

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
