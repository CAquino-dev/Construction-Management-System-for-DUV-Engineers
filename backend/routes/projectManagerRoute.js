const express = require("express");
const router = express.Router();

const {
  createProposal,
  getProposalByToken,
  respondToProposal,
  getProposalResponse,
//   renderContractPreview,     // For viewing
  generateContract,           // ✅ New: contract PDF generation
  getContract
} = require('../controller/projectManagerController');

router.post('/createProposal', createProposal);
router.get('/respond/:token', getProposalByToken);
router.post('/respond', respondToProposal);
router.get('/getProposalResponse', getProposalResponse);

router.get('/contract/:proposalId', getContract);       // View contract (EJS)
router.post('/generateContract/:proposalId', generateContract);   // ✅ Generate contract PDF

module.exports = router;
