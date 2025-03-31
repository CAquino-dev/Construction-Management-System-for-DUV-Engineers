const express = require("express");
const router = express.Router();

const {registerUser, loginUser, employeeLogin} = require("../controller/authController") //import from authController 

router.post("/register", registerUser);
router.post("/employeeLogin", employeeLogin);

module.exports = router;