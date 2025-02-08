const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, usersController.createUser);

module.exports = router;
