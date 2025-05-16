const express = require("express");
const router = express.Router();

const { getFinanceApprovedPayslips, ceoUpdatePayslipStatus  } = require("../controller/ceoManagementController") //import from authController 

router.get("/getFinanceApprovedPayslips", getFinanceApprovedPayslips);
router.put('/updatePayslipStatus', ceoUpdatePayslipStatus);

module.exports = router;