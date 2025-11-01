const express = require("express");
const router = express.Router();

const { addReportComment, getReportComment, getMilestoneBudget } = require('../controller/clientProjectController');

router.get('/getReportComments/:reportId', getReportComment);
router.post('/addComment/:reportId', addReportComment);
router.get('/getMilestoneBudget/:milestoneId', getMilestoneBudget);

module.exports = router;