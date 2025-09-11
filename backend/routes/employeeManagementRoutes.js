const express = require("express");
const router = express.Router();

const { addEmployee, checkIn, checkOut, getPermissions, getDepartments, attendanceStatus } = require('../controller/employeeManagementController');

router.get('/getDepartments', getDepartments);
router.get('/getPermissions', getPermissions);
router.get('/attendanceStatus/:employeeId', attendanceStatus);
router.post("/addEmployee", addEmployee);
router.post("/checkIn", checkIn);
router.post("/checkOut", checkOut);

module.exports = router;