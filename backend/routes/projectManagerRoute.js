const express = require("express");
const router = express.Router();

const {
  createProposal,
  getProposalByToken,
  respondToProposal,
  getProposalResponse,
//   renderContractPreview,     // For viewing
  generateContract,           // ✅ New: contract PDF generation
  getContract,
  uploadClientSignature,
  getApprovedContracts,
  sendContractToClient 
} = require('../controller/projectManagerController');

router.post('/contract/send-to-client/:id', sendContractToClient);
router.post('/createProposal', createProposal);
router.get('/respond/:token', getProposalByToken);
router.get('/getApprovedContracts', getApprovedContracts);
router.post('/respond', respondToProposal);
router.get('/getProposalResponse', getProposalResponse);

router.get('/contract/:proposalId', getContract);       // View contract (EJS)
router.post('/generateContract/:proposalId', generateContract);   // ✅ Generate contract PDF
router.post('/signature', uploadClientSignature);

module.exports = router;
