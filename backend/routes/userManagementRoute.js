const express = require("express");
const router = express.Router();

const { getEmployees, getEmployeesByDepartment } = require('../controller/userManagementController')

router.get('/getEmployees', getEmployees);
router.get('/department/:department_id', getEmployeesByDepartment);

module.exports = router;