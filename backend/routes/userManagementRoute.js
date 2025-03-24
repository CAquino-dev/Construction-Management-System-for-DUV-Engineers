const express = require("express");
const router = express.Router();

const { getUsers, getUsersByDepartment } = require('../controller/userManagementController')

router.get('/getUsers', getUsers);
router.get('/department/:department_id', getUsersByDepartment);

module.exports = router;