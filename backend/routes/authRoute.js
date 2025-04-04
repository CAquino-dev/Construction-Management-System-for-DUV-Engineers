const express = require("express");
const router = express.Router();

const {registerUser, clientLogin, employeeLogin} = require("../controller/authController") //import from authController 

router.post("/register", registerUser);
router.post("/employeeLogin", employeeLogin);
router.post("/userLogin", clientLogin);

module.exports = router;