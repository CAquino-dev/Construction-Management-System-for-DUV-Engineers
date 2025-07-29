const express = require("express");
const router = express.Router();

const { getFinance, updatePayrollStatus, getApprovedPayslips, financeUpdatePayslipStatus, financeProcessPayslipPayment, 
    getCeoApprovedPayslips, createPayment, getProjectsWithPendingPayments, getMilestonesForPaymentByProject, 
    getAllExpensesApprovedByEngineer, updateFinanceApprovalStatus, getContracts, approveContract, rejectContract } = require('../controller/financeManagementController');

router.get('/getFinance', getFinance);
router.get('/getApprovedPayslips', getApprovedPayslips);
router.get('/getCeoApprovedPayslips', getCeoApprovedPayslips);
router.get('/getContracts', getContracts);
router.put('/payroll/update-status', updatePayrollStatus);
router.put('/updatePayslipStatus', financeUpdatePayslipStatus);
router.put('/updatePaymentStatus', financeProcessPayslipPayment)
router.post('/payments', createPayment);
router.post('/contracts/:id/approve', approveContract);
router.post('/contracts/:id/reject', rejectContract);
router.get('/projects/with-pending-payments', getProjectsWithPendingPayments);
router.get('/projects/:projectId/milestones/for-payment', getMilestonesForPaymentByProject);
router.get('/project/expenses/approved-by-engineer', getAllExpensesApprovedByEngineer);
router.put('/expenses/:id/finance-approval', updateFinanceApprovalStatus);



module.exports = router;