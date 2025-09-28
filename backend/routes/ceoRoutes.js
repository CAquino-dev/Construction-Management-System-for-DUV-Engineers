const express = require("express");
const router = express.Router();

const { getFinanceApprovedPayslips, ceoUpdatePayslipStatus, getFinanceProjection  } = require("../controller/ceoManagementController") //import from authController 

router.get("/getFinanceApprovedPayslips", getFinanceApprovedPayslips);
router.get("/getFinanceProjection", getFinanceProjection);
router.put('/updatePayslipStatus', ceoUpdatePayslipStatus);

module.exports = router;