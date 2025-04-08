const express = require("express");
const router = express.Router();

const { getEmployeeSalary, getPresentEmployee, calculateEmployeeSalary, getEmployeeAttendance } = require('../controller/hrManagementController');

router.get('/getSalary', getEmployeeSalary);
router.get('/employeeAttendance', getEmployeeAttendance);
router.post('/getPresentEmployees', getPresentEmployee);
router.post('/calculateSalary', calculateEmployeeSalary);

module.exports = router;