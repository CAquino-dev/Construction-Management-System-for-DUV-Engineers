const express = require("express");
const router = express.Router();

const { getInventoryItems, updateInventoryItem, addInventoryItem } = require('../controller/inventoryController');

router.get('/getInventoryItems', getInventoryItems);
router.put('/updateInventoryItem/:itemId', updateInventoryItem);
router.post('/addInventoryItem', addInventoryItem);

module.exports = router;