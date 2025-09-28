const express = require("express");
const router = express.Router();

const { addReportComment, getReportComment } = require('../controller/clientProjectController');

router.get('/getReportComments/:reportId', getReportComment);
router.post('/addComment/:reportId', addReportComment);

module.exports = router;