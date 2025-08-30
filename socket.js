// socket.js
let ioInstance = null;

module.exports = {
  init: (httpServer, opts = {}) => {
    if (ioInstance) return ioInstance;
    const { Server } = require("socket.io");
    ioInstance = new Server(httpServer, opts);
    return ioInstance;
  },
  getIO: () => {
    if (!ioInstance) throw new Error("Socket.io not initialized. Call init(server) first.");
    return ioInstance;
  },
};
