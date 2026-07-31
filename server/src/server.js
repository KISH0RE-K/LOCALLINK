const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");

const discoveryService = require("./discovery/discoveryService");
const groupService = require("./group/groupService");

const ChatService = require("./chat/chatService");
const FileTransferService = require("./fileTransfer/fileTransferService");

const PORT = 3000;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// Create services
const chatService = new ChatService(
  io,
  discoveryService,
  groupService
);

const fileTransferService = new FileTransferService(
  io,
  discoveryService
);

// Listen for frontend Socket.IO connections
io.on("connection", (socket) => {
  console.log("Frontend Connected");

  // One-to-one chat
  socket.on("sendMessage", (data) => {
    const user = discoveryService.getUserById(data.userId);

    if (!user) {
      console.log("User not found");
      return;
    }

    chatService.sendMessage(user.ip, {
      type: "direct",
      from: discoveryService.getUsername(),
      fromId: discoveryService.getDeviceId(),
      message: data.message,
    });
  });

  // Group chat
  socket.on("sendGroupMessage", (data) => {
    chatService.sendGroupMessage(
      data.groupId,
      data.message
    );
  });
});

// Start all services
discoveryService.start();
groupService.start();
chatService.start();
fileTransferService.start();

// Start Express + Socket.IO server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});