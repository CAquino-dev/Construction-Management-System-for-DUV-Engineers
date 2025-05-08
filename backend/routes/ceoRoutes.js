const express = require("express");
const router = express.Router();

const {getFinanceApprovedPayslips} = require("../controller/ceoManagementController") //import from authController 

router.get("/getFinanceApprovedPayslips", getFinanceApprovedPayslips);

module.exports = router;