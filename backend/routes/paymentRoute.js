const express = require("express");
const router = express.Router();

const { createPaymentIntent, createCheckoutSession } = require('../controller/paymentController');

router.post('/create-intent', createPaymentIntent);
router.post('/create-checkout-session', createCheckoutSession);


module.exports = router;