const express = require("express");
const router = express.Router();

const { getUsers } = require('../controller/userManagementController')

router.get('/getUsers', getUsers);

module.exports = router;