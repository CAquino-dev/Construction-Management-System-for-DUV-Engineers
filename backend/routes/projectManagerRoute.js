const express = require("express");
const router = express.Router();

const { createProposal, getProposalByToken, respondToProposal } = require('../controller/projectManagerController')

router.post('/createProposal', createProposal)
router.get('/respond/:token', getProposalByToken);
router.post('/respond', respondToProposal);

module.exports = router;