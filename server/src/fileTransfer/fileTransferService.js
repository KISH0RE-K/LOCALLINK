const net = require("net");
const fs = require("fs");
const path = require("path");
const { sendFramed, createFrameParser } = require("../utils/framedSocket");

const FILE_PORT = 6001;
const RECEIVED_FILES_DIR = path.join(__dirname, "..", "..", "received_files");

if (!fs.existsSync(RECEIVED_FILES_DIR)) {
  fs.mkdirSync(RECEIVED_FILES_DIR, { recursive: true });
}

class FileTransferService {
  constructor(io, discoveryService) {
    this.io = io;
    this.discoveryService = discoveryService;

    this.server = net.createServer();

    // Outgoing TCP connections to other devices, keyed by IP
    this.connections = new Map();

    // Active incoming file writes, keyed by transferId
    this.incomingWriteStreams = new Map();

    // transferId -> { ip, fileName }
    // Used on BOTH sides: the sender uses it to know where to relay
    // metadata/chunks/complete, the receiver uses it briefly to know
    // where to send the "accepted" reply back to.
    this.pendingRequests = new Map();
  }

  start() {
    console.log("File Transfer Service Started");

    this.server.listen(FILE_PORT, () => {
      console.log(`File Transfer TCP Server running on port ${FILE_PORT}`);
    });

    this.server.on("connection", (socket) => {
      const onData = createFrameParser((message) => {
        this.handleIncomingMessage(message, socket);
      });

      socket.on("data", onData);

      socket.on("error", (err) => {
        console.error("File TCP socket error:", err.message);
      });
    });

    // Events coming from OUR OWN frontend via Socket.IO
    this.io.on("connection", (socket) => {
      socket.on("sendFileRequest", (data) => {
        this.handleSendFileRequest(data);
      });

      socket.on("acceptFileRequest", (data) => {
        this.handleAcceptFileRequest(data);
      });

      socket.on("sendFileMetadata", (data) => {
        this.handleSendFileMetadata(data);
      });

      socket.on("fileChunk", (data) => {
        this.handleOutgoingChunk(data);
      });

      socket.on("fileComplete", (data) => {
        this.handleOutgoingComplete(data);
      });
    });
  }

  getConnection(ip) {
    if (this.connections.has(ip)) {
      return this.connections.get(ip);
    }

    const socket = net.createConnection({ host: ip, port: FILE_PORT });

    const onData = createFrameParser((message) => {
      this.handleIncomingMessage(message, socket);
    });

    socket.on("data", onData);

    socket.on("close", () => {
      this.connections.delete(ip);
    });

    socket.on("error", (err) => {
      console.error(`File TCP connection error (${ip}):`, err.message);
      this.connections.delete(ip);
    });

    this.connections.set(ip, socket);
    return socket;
  }

  // ---------------- Sender side ----------------

  handleSendFileRequest(data) {
    const user = this.discoveryService.getUserById(data.userId);

    if (!user) {
      console.log("File transfer target not found");
      return;
    }

    this.pendingRequests.set(data.transferId, {
      ip: user.ip,
      fileName: data.fileName,
    });

    const socket = this.getConnection(user.ip);

    sendFramed(socket, {
      type: "fileRequest",
      transferId: data.transferId,
      fromId: this.discoveryService.getDeviceId(),
      from: this.discoveryService.getUsername(),
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
    });
  }

  handleSendFileMetadata(data) {
    const pending = this.pendingRequests.get(data.transferId);

    if (!pending) {
      console.log("No pending transfer for metadata:", data.transferId);
      return;
    }

    const socket = this.getConnection(pending.ip);

    sendFramed(socket, {
      type: "fileMetadata",
      transferId: data.transferId,
      fileName: data.fileName,
      relativePath: data.relativePath,
      fileSize: data.fileSize,
      fileType: data.fileType,
    });
  }

  handleOutgoingChunk(data) {
    const pending = this.pendingRequests.get(data.transferId);

    if (!pending) {
      return;
    }

    const socket = this.getConnection(pending.ip);

    const buffer = Buffer.isBuffer(data.chunk)
      ? data.chunk
      : Buffer.from(data.chunk);

    sendFramed(socket, {
      type: "fileChunk",
      transferId: data.transferId,
      chunk: buffer.toString("base64"),
    });
  }

  handleOutgoingComplete(data) {
    const pending = this.pendingRequests.get(data.transferId);

    if (!pending) {
      return;
    }

    const socket = this.getConnection(pending.ip);

    sendFramed(socket, {
      type: "fileComplete",
      transferId: data.transferId,
    });

    this.pendingRequests.delete(data.transferId);
  }

  // ---------------- Receiver side ----------------

  handleAcceptFileRequest(data) {
    const pending = this.pendingRequests.get(data.transferId);

    if (!pending) {
      console.log("No pending request found for accept:", data.transferId);
      return;
    }

    const socket = this.getConnection(pending.ip);

    sendFramed(socket, {
      type: "fileAccepted",
      transferId: data.transferId,
    });

    this.pendingRequests.delete(data.transferId);
  }

  handleIncomingMessage(message, socket) {
    switch (message.type) {
      case "fileRequest": {
        const remoteIp = socket.remoteAddress.replace("::ffff:", "");

        this.pendingRequests.set(message.transferId, {
          ip: remoteIp,
          fileName: message.fileName,
        });

        this.io.emit("fileRequest", {
          transferId: message.transferId,
          fromId: message.fromId,
          from: message.from,
          fileName: message.fileName,
          fileSize: message.fileSize,
          fileType: message.fileType,
        });
        break;
      }

      case "fileAccepted":
        this.io.emit("fileAccepted", {
          transferId: message.transferId,
        });
        break;

      case "fileMetadata": {
        const { fileName, filePath } = this.getUniqueFilePath(
          message.fileName,
        );

        const writeStream = fs.createWriteStream(filePath);

        this.incomingWriteStreams.set(message.transferId, {
          stream: writeStream,
          filePath,
          fileName,
          receivedBytes: 0,
          totalBytes: message.fileSize,
        });

        this.io.emit("fileMetadata", {
          transferId: message.transferId,
          fileName,
          fileSize: message.fileSize,
          fileType: message.fileType,
        });
        break;
      }

      case "fileChunk": {
        const transfer = this.incomingWriteStreams.get(message.transferId);

        if (!transfer) return;

        const buffer = Buffer.from(message.chunk, "base64");

        transfer.stream.write(buffer);
        transfer.receivedBytes += buffer.length;

        const progress = Math.min(
          Math.round((transfer.receivedBytes / transfer.totalBytes) * 100),
          100,
        );

        this.io.emit("fileChunk", {
          transferId: message.transferId,
          receivedBytes: transfer.receivedBytes,
          progress,
        });
        break;
      }

      case "fileComplete": {
        const transfer = this.incomingWriteStreams.get(message.transferId);

        if (!transfer) return;

        transfer.stream.end(() => {
          this.io.emit("fileComplete", {
            transferId: message.transferId,
            fileName: transfer.fileName,
            savedPath: transfer.filePath,
          });
        });

        this.incomingWriteStreams.delete(message.transferId);
        break;
      }

      default:
        console.log("Unknown file transfer message type:", message.type);
    }
  }

  getUniqueFilePath(originalName) {
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext);

    let fileName = originalName;
    let counter = 1;

    while (fs.existsSync(path.join(RECEIVED_FILES_DIR, fileName))) {
      fileName = `${base}(${counter})${ext}`;
      counter += 1;
    }

    return {
      fileName,
      filePath: path.join(RECEIVED_FILES_DIR, fileName),
    };
  }
}

module.exports = FileTransferService;
