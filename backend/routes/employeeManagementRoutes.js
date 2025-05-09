const express = require("express");
const router = express.Router();

const { addEmployee, checkIn, checkOut } = require('../controller/employeeManagementController');

router.post("/addEmployee", addEmployee);
router.post("/checkIn", checkIn);
router.post("/checkOut", checkOut);

module.exports = router;