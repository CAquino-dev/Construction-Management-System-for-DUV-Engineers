const express = require("express");
const router = express.Router();

const { getEmployeeSalary, getPresentEmployee, calculateEmployeeSalary, getEmployeeAttendance, approvePayroll, rejectPayroll } = require('../controller/hrManagementController');

router.get('/getSalary', getEmployeeSalary);
router.get('/employeeAttendance', getEmployeeAttendance);
router.post('/getPresentEmployees', getPresentEmployee);
router.post('/calculateSalary', calculateEmployeeSalary);
router.post('/approvePayroll', approvePayroll);
router.post('/rejectedPayroll', rejectPayroll);

module.exports = router;