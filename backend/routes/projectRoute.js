// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getEstimate, getMilestones } = require('../controller/projectController');  // Importing the controller

// POST route for calculating the project estimate
router.post('/estimate', getEstimate);
router.get('/getMilestones/:projectId', getMilestones);

module.exports = router;