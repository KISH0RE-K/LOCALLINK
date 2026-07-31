const dgram = require("dgram");
const { getLocalIP } = require("../utils/network");
const { v4: uuidv4 } = require("uuid");
const userConfig = require("../config/userConfig");

const DISCOVERY_PORT = 5000;

class DiscoveryService {
  constructor() {
    this.socket = dgram.createSocket("udp4");
    this.onlineUsers = [];
    this.localIP = getLocalIP();
    this.deviceId = uuidv4();
    this.username = userConfig.username;
  }
  getUserById(id) {
    return this.onlineUsers.find((user) => user.id === id);
  }
  start() {
    this.socket.on("error", (err) => {
      console.error("UDP Socket Error:", err.message);
    });
    this.socket.bind(DISCOVERY_PORT, () => {
      this.socket.setBroadcast(true);

      // Listen for incoming UDP packets
      this.socket.on("message", (msg, rinfo) => {
        if (rinfo.address === this.localIP) {
          return;
        }
        let data;

        try {
          data = JSON.parse(msg.toString());
        } catch (err) {
          return;
        }

        if (!data.id || !data.username || !data.port) {
          return;
        }

        const existingUser = this.onlineUsers.find(
          (user) => user.id === data.id,
        );

        if (!existingUser) {
          this.onlineUsers.push({
            id: data.id,
            username: data.username,
            ip: rinfo.address,
            port: data.port,
            lastSeen: Date.now(),
          });
        } else {
          existingUser.lastSeen = Date.now();
        }
      });

      this.broadcastPresence();

      setInterval(() => {
        this.broadcastPresence();
      }, 3000);

      setInterval(() => {
        this.removeOfflineUsers();
      }, 3000);
    });
  }
  removeOfflineUsers() {
    const OFFLINE_TIMEOUT = 10000;

    this.onlineUsers = this.onlineUsers.filter((user) => {
      return Date.now() - user.lastSeen < OFFLINE_TIMEOUT;
    });
  }
  getOnlineUsers() {
    return this.onlineUsers;
  }
  getUsername() {
    return this.username;
  }
  getDeviceId() {
    return this.deviceId;
  }
  broadcastPresence() {
    const message = JSON.stringify({
      id: this.deviceId,
      username: this.username,
      port: DISCOVERY_PORT,
    });

    const buffer = Buffer.from(message);

    this.socket.send(
      buffer,
      0,
      buffer.length,
      DISCOVERY_PORT,
      "255.255.255.255",
    );
  }
}

module.exports = new DiscoveryService();
