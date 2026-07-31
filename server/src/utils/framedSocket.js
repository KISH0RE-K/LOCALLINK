// Raw TCP sockets do NOT preserve message boundaries.
// A single write() can be split across multiple "data" events,
// and multiple writes can arrive merged into a single "data" event.
//
// This wraps every message with a 4-byte length prefix so the
// receiving side always knows exactly how many bytes to wait for
// before trying to JSON.parse() anything.

function sendFramed(socket, obj) {
  const payload = JSON.stringify(obj);
  const payloadBuffer = Buffer.from(payload, "utf8");

  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(payloadBuffer.length, 0);

  socket.write(Buffer.concat([lengthBuffer, payloadBuffer]));
}

// Returns a function you attach to socket.on("data", ...).
// It buffers incoming bytes and calls onMessage(obj) once per
// complete framed message, however the bytes actually arrived.
function createFrameParser(onMessage) {
  let buffer = Buffer.alloc(0);

  return function onData(data) {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length >= 4) {
      const messageLength = buffer.readUInt32BE(0);

      if (buffer.length < 4 + messageLength) {
        break; // full message hasn't arrived yet, wait for more data
      }

      const messageBuffer = buffer.slice(4, 4 + messageLength);
      buffer = buffer.slice(4 + messageLength);

      try {
        const message = JSON.parse(messageBuffer.toString("utf8"));
        onMessage(message);
      } catch (err) {
        console.error("Failed to parse framed message:", err.message);
      }
    }
  };
}

module.exports = { sendFramed, createFrameParser };
