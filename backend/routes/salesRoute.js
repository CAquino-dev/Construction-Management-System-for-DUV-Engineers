// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { createLead, getLeads } = require('../controller/salesController');  // Importing the controller

// POST route for calculating the project estimate
router.post('/createLead', createLead);
router.get('/getLeads', getLeads);

module.exports = router;