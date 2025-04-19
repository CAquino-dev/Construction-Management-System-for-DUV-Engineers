const express = require("express");
const router = express.Router();

const { getEmployeeSalary, getPresentEmployee, calculateEmployeeSalary, 
        getEmployeeAttendance, getPayrollRecords, updatePayrollStatus, 
        createPayslip, getPayslips, getPayslipById, 
        updatePayslipItemStatus, updatePayslipStatus} = require('../controller/hrManagementController');

router.get('/getSalary', getEmployeeSalary);
router.get('/payroll', getPayrollRecords);
router.get('/getPayslips', getPayslips);
router.get('/employeeAttendance', getEmployeeAttendance);
router.get('/payslips/:id', getPayslipById);
router.post('/getPresentEmployees', getPresentEmployee);
router.post('/calculateSalary', calculateEmployeeSalary);
router.post('/payslip/create', createPayslip);
router.put('/payroll/update-status', updatePayrollStatus);
router.put('/updatePayslipItemStatus', updatePayslipItemStatus);
router.put('/updatePayslipStatus', updatePayslipStatus);


module.exports = router;