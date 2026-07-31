const os = require("os");

function getLocalIP() {
    const interfaces = os.networkInterfaces();

    for (const interfaceName in interfaces) {
        for (const network of interfaces[interfaceName]) {

            if (
                network.family === "IPv4" &&
                !network.internal
            ) {
                return network.address;
            }

        }
    }

    return null;
}

module.exports = { getLocalIP };