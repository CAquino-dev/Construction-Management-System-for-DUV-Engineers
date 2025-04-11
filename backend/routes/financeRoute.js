const express = require("express");
const router = express.Router();

const { getFinance } = require('../controller/financeManagementController');

router.get('/getFinance', getFinance);

module.exports = router;