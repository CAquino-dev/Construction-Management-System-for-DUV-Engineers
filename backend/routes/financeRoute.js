const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import controller functions
const {
  getFinance,
  updatePayrollStatus,
  getApprovedPayslips,
  financeUpdatePayslipStatus,
  financeProcessPayslipPayment,
  getCeoApprovedPayslips,
  clientPayment,
  getProjectsWithPendingPayments,
  getMilestonesForPaymentByProject,
  getAllExpensesApprovedByEngineer,
  updateFinanceApprovalStatus,
  getContracts,
  updateContractApprovalStatus,
  getProcurementApprovedMilestones,
  uploadSalarySignature,
  getReleasedPayslips,
  getDeliveredPurchaseOrders,
  processFinancePayment,
  recordClientCashPayment
} = require("../controller/financeManagementController");

// Ensure finance_signatures folder exists
const financeSignatureDir = path.join(__dirname, "../public/finance_signatures");
if (!fs.existsSync(financeSignatureDir)) {
  fs.mkdirSync(financeSignatureDir, { recursive: true });
}

// ✅ Configure storage for uploaded finance attachments/signatures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, financeSignatureDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage }); // define before using it ✅

// ✅ ROUTES
router.get("/getFinance", getFinance);
router.get("/getApprovedPayslips", getApprovedPayslips);
router.get("/getCeoApprovedPayslips", getCeoApprovedPayslips);
router.get("/getContracts", getContracts);
router.get("/procurementApproved", getProcurementApprovedMilestones);
router.get("/getReleasedPayslips", getReleasedPayslips);
router.put("/payroll/update-status", updatePayrollStatus);
router.put("/updatePayslipStatus", financeUpdatePayslipStatus);
router.put("/updatePaymentStatus", financeProcessPayslipPayment);
router.post("/payments", clientPayment);
router.put("/updateContractApprovalStatus/:id", updateContractApprovalStatus);
router.post("/salary/paySalary", uploadSalarySignature);
router.get("/projects/with-pending-payments", getProjectsWithPendingPayments);
router.get("/projects/:projectId/milestones/for-payment", getMilestonesForPaymentByProject);
router.get("/project/expenses/approved-by-engineer", getAllExpensesApprovedByEngineer);
router.put("/:id/finance-approval", updateFinanceApprovalStatus);
router.get("/purchase-orders/delivered-unpaid", getDeliveredPurchaseOrders);

// ✅ Finance payment upload route (attachments + signature)
router.post(
  "/processFinancePayment",
  upload.fields([
    { name: "attachments", maxCount: 10 },
    { name: "signature", maxCount: 1 },
  ]),
  processFinancePayment
);

router.post("/recordClientCashPayment", recordClientCashPayment);

module.exports = router;
