const express = require("express");
const router = express.Router();

const { getEngineers, createProject, getClients, getClientProject, getEngineerProjects,
     createMilestone, getMilestonesForPaymentByProject, completeMilestone
    ,updateMtoItems, updateForemanReports, updateMilestoneStatus } = require('../controller/engineerManagementController');

router.get('/getEngineers', getEngineers);
router.get('/getClients', getClients);
router.post('/createProject', createProject);
router.get('/getClientProject/:clientId', getClientProject);
router.get('/getEngineerProjects/:employeeId', getEngineerProjects);
router.post('/createMilestones/:projectId', createMilestone);
router.get('/projects/:projectId/milestones/for-payment', getMilestonesForPaymentByProject);
router.post('/milestones/:id/complete', completeMilestone);
router.put('/milestones/mto', updateMtoItems);
router.put('/updateForemanReports/:reportId', updateForemanReports);
router.put('/milestones/update-status', updateMilestoneStatus);



module.exports = router;