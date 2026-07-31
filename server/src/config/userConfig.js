const os = require("os");

// The old version did `this.username` inside the module.exports object
// literal. At that point `this` refers to the (still-being-built) exports
// object itself, so `this.username` was always undefined. That undefined
// value then got dropped entirely by JSON.stringify() during broadcast,
// which meant every receiving device's own validation check
// (`if (!data.username) return`) silently threw the broadcast away.
// Net effect: no user ever showed up online, on any device.
//
// Fix: pick a real username. Override with an env var if you want a
// specific display name, otherwise fall back to the machine's hostname.
const username = process.env.LOCALLINK_USERNAME || os.hostname() || "Guest";

module.exports = {
  username,
};
