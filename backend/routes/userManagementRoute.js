const express = require("express");
const router = express.Router();

const { getEmployees, getEmployeesByDepartment, getAllUsers } = require('../controller/userManagementController')

router.get('/getEmployees', getEmployees);
router.get('/department/:department_id', getEmployeesByDepartment);

router.get("/all", getAllUsers);

module.exports = router;