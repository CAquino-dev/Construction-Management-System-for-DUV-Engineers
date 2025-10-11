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
  clientRejectContract,
  getPaymentTerms,
  createSiteVisit,
  getScheduledSiteVisits,
  getForProcurement
} = require('../controller/projectManagerController');

router.post('/contract/send-to-client/:id', sendContractToClient);
router.post('/createProposal', createProposal);
router.get('/respond/:token', getProposalByToken);
router.get('/getApprovedContracts', getApprovedContracts);
router.get('/getPaymentTerms', getPaymentTerms);
router.post('/respond', respondToProposal);
router.get('/getProposalResponse', getProposalResponse);
router.post('/contracts/:id/reject', clientRejectContract);
router.get('/contract/:proposalId', getContract);       
router.post('/generateContract/:proposalId', generateContract); 
router.post('/signature', uploadClientSignature);
router.post('/createSiteVisit', createSiteVisit);
router.get('/getSiteVisits', getScheduledSiteVisits);
router.get('/getForProcurement', getForProcurement);

module.exports = router;
