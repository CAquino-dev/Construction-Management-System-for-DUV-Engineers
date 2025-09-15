const express = require("express");
const router = express.Router();

const { createPaymentIntent, createCheckoutSession, createInitialPayment } = require('../controller/paymentController');

router.post('/create-intent', createPaymentIntent);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/initial', createInitialPayment);



module.exports = router;