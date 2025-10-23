// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { createLead, getLeads, getLeadsList, getSiteVisitReport } = require('../controller/salesController');  // Importing the controller

// POST route for calculating the project estimate
router.post('/createLead', createLead);
router.get('/getLeads', getLeads);
router.get('/getLeadList', getLeadsList);
router.get('/getSiteVisitReport/:leadId', getSiteVisitReport);

module.exports = router;