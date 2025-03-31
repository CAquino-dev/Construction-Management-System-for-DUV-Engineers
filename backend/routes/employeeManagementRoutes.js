const express = require("express");
const router = express.Router();

const { addEmployee } = require('../controller/employeeManagementController');

router.post("/addEmployee", addEmployee);

module.exports = router;