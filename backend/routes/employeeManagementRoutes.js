const express = require("express");
const router = express.Router();

const { addEmployee, checkIn, checkOut, 
    getPermissions, getDepartments, attendanceStatus,
    getEmployeeInformation, getEmployeeAttendance, getEmployeeSalary} = require('../controller/employeeManagementController');

router.get('/getDepartments', getDepartments);
router.get('/getPermissions', getPermissions);
router.get('/getEmployeeInformation/:id', getEmployeeInformation);
router.get('/getEmployeeAttendance/:id', getEmployeeAttendance);
router.get('/getEmployeeSalary/:id', getEmployeeSalary);
router.get('/attendanceStatus/:employeeId', attendanceStatus);
router.post("/addEmployee", addEmployee);
router.post("/checkIn", checkIn);
router.post("/checkOut", checkOut);

module.exports = router;