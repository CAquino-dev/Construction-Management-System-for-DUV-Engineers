// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getEstimate, getMilestones, createExpense, 
    getExpenses, getPendingExpenses, updateEngineerApproval, 
    updateMilestoneStatus, createProjectWithClient, getContractById} = require('../controller/projectController');  // Importing the controller

// POST route for calculating the project estimate
router.post('/estimate', getEstimate);
router.get('/getMilestones/:projectId', getMilestones);
router.post('/expenses', createExpense);
router.get('/project/expenses', getExpenses);
router.get('/project/expenses/pending-engineer', getPendingExpenses);
router.put('/project/expenses/:expenseId/engineer-approval', updateEngineerApproval);
router.post('/project/milestones/:id/status', updateMilestoneStatus);
router.post('/createProject', createProjectWithClient)
router.get("/:contractId", getContractById);



module.exports = router;