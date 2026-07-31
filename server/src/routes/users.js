const express = require("express");
const router = express.Router();
const discoveryService = require("../discovery/discoveryService");

router.get("/", (req, res) => {
  const users = discoveryService.getOnlineUsers().map((user) => ({
    id: user.id,
    username: user.username,
  }));

  res.json(users);
});

module.exports = router;
