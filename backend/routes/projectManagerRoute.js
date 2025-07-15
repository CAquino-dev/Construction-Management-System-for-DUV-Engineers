const express = require("express");
const router = express.Router();

const { createProposal, getProposalByToken } = require('../controller/projectManagerController')

router.post('/createProposal', createProposal)
router.get('/respond/:token', getProposalByToken);

module.exports = router;