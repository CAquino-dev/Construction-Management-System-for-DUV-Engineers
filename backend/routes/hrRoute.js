const express = require("express");
const router = express.Router();

const { getEmployeeSalary, getPresentEmployee } = require('../controller/hrManagementController');

router.get('/getSalary', getEmployeeSalary);
router.post('/getPresentEmployees', getPresentEmployee);

module.exports = router;