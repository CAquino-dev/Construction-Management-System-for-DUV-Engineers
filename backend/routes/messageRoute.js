const express = require("express");
const router = express.Router();

const { sendProjectMessage, getProjectMessages } = require('../controller/messageController')

router.post('/project-messages/:projectId', sendProjectMessage)
router.get('/project-messages/:projectId', getProjectMessages)

module.exports = router;