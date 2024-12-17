const express = require("express");
const { loginController, registerController } = require("../Controllers/userController");
const Router = express.Router();

const { protect } = require("../middleware/authMiddleware");

Router.post("/login", loginController);
Router.post("/register", registerController);

module.exports = Router;