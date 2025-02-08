const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/login", loginController.login);
router.get("/test", verifyToken, loginController.test);

module.exports = router;
