const express = require("express");
const router = express.Router();

const {registerUser, Login} = require("../controller/authController") //import from authController 

router.post("/register", registerUser);
router.post("/login", Login);

module.exports = router;