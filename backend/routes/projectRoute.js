// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getEstimate, getMilestones, createExpense, 
    getExpenses, getPendingExpenses, updateEngineerApproval, 
    updateMilestoneStatus, createProjectWithClient, getContractById,
    createMilestone, getBoqByProject, getTasks, addTask, updateTask,
    deleteTask, getReports, submitReport, getMilestoneTaskReports,
    getPaymentScheduleByProject, getLegals} = require('../controller/projectController');  // Importing the controller

// POST route for calculating the project estimate
router.post('/estimate', getEstimate);
router.post('/createMilestone', createMilestone);
router.get('/getMilestones/:projectId', getMilestones);
router.get('/getPaymentScheduleByProject/:projectId', getPaymentScheduleByProject);
router.post('/expenses', createExpense);
router.get('/project/expenses', getExpenses);
router.get('/project/expenses/pending-engineer', getPendingExpenses);
router.put('/project/expenses/:expenseId/engineer-approval', updateEngineerApproval);
router.put('/updateTask/:taskId', updateTask);
router.post('/project/milestones/:id/status', updateMilestoneStatus);
router.post('/createProject', createProjectWithClient)
router.post('/addTask/:milestoneId', addTask);
router.get('/getMilestoneTasks/:milestoneId', getTasks);
router.get('/getReports/:projectId', getReports);
router.get("/:contractId", getContractById);
router.get("/:projectId/boq", getBoqByProject);
router.get("/getMilestoneTaskReports/:milestoneId", getMilestoneTaskReports);
router.delete('/deleteTask/:taskId', deleteTask);
router.post('/submitReport/:projectId', submitReport);
router.get('/getLegals/:projectId', getLegals);



module.exports = router;