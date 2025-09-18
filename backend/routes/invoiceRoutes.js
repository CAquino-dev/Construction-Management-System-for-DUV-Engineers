const express = require("express");
const router = express.Router();
const { sendInvoiceForNextSchedule } = require("../controller/invoiceController");

router.post("/send-next", sendInvoiceForNextSchedule);

module.exports = router;