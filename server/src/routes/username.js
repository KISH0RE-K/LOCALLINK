const express = require("express");
const router = express.Router();
const discoveryService = require("../discovery/discoveryService");

// GET current username
router.get("/", (req, res) => {
  res.json({ username: discoveryService.getUsername() });
});

// PUT to update username
router.put("/", (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ error: "Invalid username" });
  }

  discoveryService.username = username.trim();

  res.json({ username: discoveryService.username });
});

module.exports = router;
