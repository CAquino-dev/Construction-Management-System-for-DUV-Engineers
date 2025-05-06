// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getEstimate } = require('../controller/projectController');  // Importing the controller

// POST route for calculating the project estimate
router.post('/estimate', getEstimate);

module.exports = router;