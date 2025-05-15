const express = require("express");
const router = express.Router();

const { addEmployee, checkIn, checkOut, getPermissions, getDepartments } = require('../controller/employeeManagementController');

router.get('/getDepartments', getDepartments);
router.get('/getPermissions', getPermissions);
router.post("/addEmployee", addEmployee);
router.post("/checkIn", checkIn);
router.post("/checkOut", checkOut);

module.exports = router;