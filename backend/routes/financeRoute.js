const express = require("express");
const router = express.Router();

const { getFinance, updatePayrollStatus } = require('../controller/financeManagementController');

router.get('/getFinance', getFinance);
router.put('/payroll/update-status', updatePayrollStatus);

module.exports = router;