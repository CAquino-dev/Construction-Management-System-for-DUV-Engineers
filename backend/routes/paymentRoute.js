const express = require("express");
const router = express.Router();

const { createPaymentIntent, createCheckoutSession, createInitialPayment, generatePaymentSchedule } = require('../controller/paymentController');

router.post('/payment-schedule/:contractId', generatePaymentSchedule);
router.post('/create-intent', createPaymentIntent);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/initial', createInitialPayment);



module.exports = router;