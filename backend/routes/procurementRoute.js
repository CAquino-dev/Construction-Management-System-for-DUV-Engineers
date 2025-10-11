const express = require("express");
const router = express.Router();

const { addSupplier, getSuppliers, updateSupplier, 
    deleteSupplier, sendQuotationRequests, getQuoteByToken,
    submitSupplierQuote, getMilestonesWithQuotes, getQuotesByMilestone,
    approveQuote, } = require('../controller/procurementController');

router.get('/getSuppliers', getSuppliers);
router.get('/getQuoteByToken/:token', getQuoteByToken)
router.post('/addSupplier', addSupplier);
router.put('/updateSupplier/:supplierId', updateSupplier);
router.delete('/deleteSupplier/:supplierId', deleteSupplier);
router.post('/sendQuotationRequests', sendQuotationRequests);
router.post('/submitSupplierQuote/:token', submitSupplierQuote);
router.get("/quotes/milestones", getMilestonesWithQuotes);
router.get("/quotes/milestone/:milestoneId", getQuotesByMilestone);
router.post("/quotes/:quoteId/approve", approveQuote);


module.exports = router;