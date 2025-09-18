const express = require("express");
const router = express.Router();

const { handlePayMongoWebhook } = require("../controller/webhookController");

router.post("/paymongo", express.json({ type: "application/json" }), handlePayMongoWebhook);

module.exports = router;