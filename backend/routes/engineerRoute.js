const express = require("express");
const router = express.Router();

const { getEngineers } = require('../controller/engineerManagementController');

router.get('/getEngineers', getEngineers);


module.exports = router;