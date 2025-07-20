const express = require("express");
const router = express.Router();

const { getMessagesByProject, postMessage } = require('../controller/messagesController');

// Get all messages for a project
router.get('/chat/:projectId', getMessagesByProject);

// Post a new message
router.post('/chat', postMessage);


module.exports = router;