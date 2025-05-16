const express = require("express");
const router = express.Router();

const { getFinance, updatePayrollStatus, getApprovedPayslips, financeUpdatePayslipStatus, financeProcessPayslipPayment, getCeoApprovedPayslips } = require('../controller/financeManagementController');

router.get('/getFinance', getFinance);
router.get('/getApprovedPayslips', getApprovedPayslips);
router.get('/getCeoApprovedPayslips', getCeoApprovedPayslips);
router.put('/payroll/update-status', updatePayrollStatus);
router.put('/updatePayslipStatus', financeUpdatePayslipStatus);
router.put('/updatePaymentStatus', financeProcessPayslipPayment)


module.exports = router;