const express = require('express');
const router = express.Router();
const { handleChat } = require('../controller/chatController');

router.post('/', handleChat);

module.exports = router;
