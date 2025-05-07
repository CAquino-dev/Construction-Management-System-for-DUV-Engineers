const express = require("express");
const router = express.Router();

const { getEngineers, createProject, getClients, getClientProject, getEngineerProjects } = require('../controller/engineerManagementController');

router.get('/getEngineers', getEngineers);
router.get('/getClients', getClients);
router.post('/createProject', createProject);
router.get('/getClientProject/:clientId', getClientProject);
router.get('/getEngineerProjects/:engineerId', getEngineerProjects);



module.exports = router;