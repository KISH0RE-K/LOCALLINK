const express = require("express");
const cors = require("cors");
const groupRoutes = require("./routes/groups");

const app = express();

app.use(cors());
app.use(express.json());

const usersRoute = require("./routes/users");

app.use("/users", usersRoute);
app.use("/groups", groupRoutes);

module.exports = app;