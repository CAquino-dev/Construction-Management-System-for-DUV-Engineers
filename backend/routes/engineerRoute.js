const express = require("express");
const router = express.Router();

const { getEngineers, createProject, getClients, getClientProject } = require('../controller/engineerManagementController');

router.get('/getEngineers', getEngineers);
router.get('/getClients', getClients);
router.post('/createProject', createProject);
router.get('/getClientProject/:clientId', getClientProject);



module.exports = router;