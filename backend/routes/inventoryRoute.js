const express = require("express");
const router = express.Router();

const { 
getInventoryItems, updateInventoryItem, addInventoryItem,
inventoryRequest, getInventoryRequests, updateRequestStatus, 
getUserRequest, claimItem, getMaterialCatalog, createTransaction,
getProjectInventory, getPendingDeliveries, updateDeliveredQuantity,
markAsDelivered, getTransactionHistory
} = require('../controller/inventoryController');

router.get('/getInventoryItems', getInventoryItems);
router.get('/getRequests', getInventoryRequests);
router.get('/getUserRequests/:userId', getUserRequest);
router.get('/getMaterialCatalog', getMaterialCatalog);
router.get('/getProjectInventory/:projectId', getProjectInventory);
router.get('/getPendingDeliveries/:projectId', getPendingDeliveries);
router.put('/updateInventoryItem/:itemId', updateInventoryItem);
router.put('/updateRequest/:requestId', updateRequestStatus);
router.put('/claimItem/:requestId', claimItem);
router.post('/addInventoryItem', addInventoryItem);
router.post('/request/:userId', inventoryRequest);
router.post('/transaction', createTransaction);
router.post('/updateDeliveredQuantity', updateDeliveredQuantity);
router.put("/purchaseOrders/markDelivered/:po_id", markAsDelivered);
router.get('/getTransactionHistory/:projectId', getTransactionHistory);

module.exports = router;