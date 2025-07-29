const express = require("express");
const router = express.Router();

const {
  createProposal,
  getProposalByToken,
  respondToProposal,
  getProposalResponse,
  generateContract,        
  getContract,
  uploadClientSignature,
  getApprovedContracts,
  sendContractToClient,
  clientRejectContract
} = require('../controller/projectManagerController');

router.post('/contract/send-to-client/:id', sendContractToClient);
router.post('/createProposal', createProposal);
router.get('/respond/:token', getProposalByToken);
router.get('/getApprovedContracts', getApprovedContracts);
router.post('/respond', respondToProposal);
router.get('/getProposalResponse', getProposalResponse);
router.post('/contracts/:id/reject', clientRejectContract);
router.get('/contract/:proposalId', getContract);       
router.post('/generateContract/:proposalId', generateContract); 
router.post('/signature', uploadClientSignature);

module.exports = router;
