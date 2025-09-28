const express = require("express");
const router = express.Router();

const { 
getInventoryItems, updateInventoryItem, addInventoryItem,
inventoryRequest, getInventoryRequests, updateRequestStatus, 
getUserRequest, claimItem
} = require('../controller/inventoryController');

router.get('/getInventoryItems', getInventoryItems);
router.get('/getRequests', getInventoryRequests);
router.get('/getUserRequests/:userId', getUserRequest);
router.put('/updateInventoryItem/:itemId', updateInventoryItem);
router.put('/updateRequest/:requestId', updateRequestStatus);
router.put('/claimItem/:requestId', claimItem);
router.post('/addInventoryItem', addInventoryItem);
router.post('/request/:userId', inventoryRequest);

module.exports = router;