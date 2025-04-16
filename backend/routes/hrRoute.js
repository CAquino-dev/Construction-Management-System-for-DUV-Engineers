const express = require("express");
const router = express.Router();

const { getEmployeeSalary, getPresentEmployee, calculateEmployeeSalary, getEmployeeAttendance, getPayrollRecords, updatePayrollStatus, createPayslip, getPayslips} = require('../controller/hrManagementController');

router.get('/getSalary', getEmployeeSalary);
router.get('/payroll', getPayrollRecords);
router.get('/getPayslips', getPayslips);
router.get('/employeeAttendance', getEmployeeAttendance);
router.post('/getPresentEmployees', getPresentEmployee);
router.post('/calculateSalary', calculateEmployeeSalary);
router.post('/payslip/create', createPayslip);
router.put('/payroll/update-status', updatePayrollStatus);


module.exports = router;