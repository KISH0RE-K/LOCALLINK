const net = require("net");
const { sendFramed, createFrameParser } = require("../utils/framedSocket");

const CHAT_PORT = 6000;

class ChatService {
    constructor(io, discoveryService, groupService) {
        this.io = io;
        this.discoveryService = discoveryService;
        this.groupService = groupService;

        this.server = net.createServer();
        this.connections = new Map();
    }

    start() {
        console.log("Chat Service Started");

        this.server.listen(CHAT_PORT, () => {
            console.log(`Chat TCP Server running on port ${CHAT_PORT}`);
        });

        this.server.on("connection", (socket) => {
            console.log("New TCP Connection");

            const onData = createFrameParser((packet) => {
                if (packet.type === "group") {

                    this.io.emit("groupMessageReceived", {
                        groupId: packet.groupId,
                        from: packet.from,
                        fromId: packet.fromId,
                        message: packet.message
                    });

                } else {

                    this.io.emit("messageReceived", {
                        from: packet.from,
                        fromId: packet.fromId,
                        message: packet.message
                    });

                }
            });

            socket.on("data", onData);

            socket.on("error", (err) => {
                console.error("Chat TCP socket error:", err.message);
            });
        });

        this.io.on("connection", (socket) => {

            socket.on("sendGroupMessage", (data) => {

                this.sendGroupMessage(
                    data.groupId,
                    data.message
                );

            });

        });
    }

    // BUG (fixed): this method existed but was never called anywhere,
    // so no outgoing TCP connection to a peer was ever created.
    // sendMessage() below now calls this automatically when needed.
    connectToUser(ip) {

        if (this.connections.has(ip)) {
            return this.connections.get(ip);
        }

        const socket = net.createConnection({
            host: ip,
            port: CHAT_PORT
        });

        // Store the socket immediately, not just after "connect" fires.
        // Node queues any writes made before the TCP handshake completes
        // and flushes them automatically once connected, so it's safe
        // to hand this socket out right away.
        this.connections.set(ip, socket);

        socket.on("connect", () => {
            console.log(`Connected to ${ip}`);
        });

        socket.on("close", () => {
            this.connections.delete(ip);
        });

        socket.on("error", (err) => {
            console.error(`Chat TCP connection error (${ip}):`, err.message);
            this.connections.delete(ip);
        });

        return socket;
    }

    sendMessage(ip, packet) {

        let socket = this.connections.get(ip);

        if (!socket) {
            socket = this.connectToUser(ip);
        }

        sendFramed(socket, packet);

    }

    sendGroupMessage(groupId, message) {

        const group = this.groupService
            .getGroups()
            .find(g => g.id === groupId);

        if (!group) {
            console.log("Group not found");
            return;
        }

        for (const member of group.members) {

            if (member.id === this.discoveryService.getDeviceId()) {
                continue;
            }

            const user = this.discoveryService.getUserById(member.id);

            if (!user) {
                continue;
            }

            this.sendMessage(user.ip, {
                type: "group",
                groupId,
                from: this.discoveryService.getUsername(),
                fromId: this.discoveryService.getDeviceId(),
                message
            });

        }

    }
}

module.exports = ChatService;
