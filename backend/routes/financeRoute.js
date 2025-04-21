const express = require("express");
const router = express.Router();

const { getFinance, updatePayrollStatus, getApprovedPayslips, financeUpdatePayslipStatus } = require('../controller/financeManagementController');

router.get('/getFinance', getFinance);
router.get('/getApprovedPayslips', getApprovedPayslips);
router.put('/payroll/update-status', updatePayrollStatus);
router.put('/updatePayslipStatus', financeUpdatePayslipStatus);


module.exports = router;