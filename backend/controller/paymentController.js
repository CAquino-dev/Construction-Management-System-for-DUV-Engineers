const https = require('https');
const db = require("../config/db");

const PAYMONGO_SECRET_KEY = 'sk_test_JgUY3ATdxSYcTADVGssDXLYS'; // Replace with your actual secret key

function createPaymentIntent(req, res) {
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  const amountInCentavos = Math.round(amount * 100);

  const postData = JSON.stringify({
    data: {
      attributes: {
        amount: amountInCentavos,
        currency: 'PHP',
        payment_method_allowed: ['card'],
        payment_method_options: {
          card: {
            request_three_d_secure: 'any',
          },
        },
        description: 'Payment for Engineer ERP service',
      },
    },
  });

  const auth = Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64');

  const options = {
    hostname: 'api.paymongo.com',
    path: '/v1/payment_intents',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const request = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        const parsedData = JSON.parse(data);
        res.status(201).json(parsedData.data);
      } else {
        res.status(response.statusCode).json({
          message: 'Failed to create payment intent',
          error: data,
        });
      }
    });
  });

  request.on('error', (error) => {
    console.error('Request error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  });

  request.write(postData);
  request.end();
}

function createCheckoutSession(req, res) {
  const { amount, currency = 'PHP', description = 'Payment for Engineer ERP service' } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  const amountInCentavos = Math.round(amount * 100);

//   const postData = JSON.stringify({
//     data: {
//       attributes: {
//         amount: amountInCentavos,
//         currency,
//         description,
//         payment_method_types: ['card', 'gcash', 'grabpay'], // adjust as needed
//         success_url: 'http://localhost:5173/admin-dashboard/finance/financePayment', // replace with your frontend URLs
//         cancel_url: 'http://localhost:5173/admin-dashboard/finance/financePayment',
//       },
//     },
//   });
const postData = JSON.stringify({
  data: {
    attributes: {
      amount: amountInCentavos,
      currency,
      description,
      payment_method_types: ['card', 'gcash'],
      success_url: 'http://localhost:5173/admin-dashboard/finance/financePayment',
      cancel_url: 'http://localhost:5173/admin-dashboard/finance/financePayment',
      line_items: [
        {
          name: "Engineer ERP Payment",
          description: "Milestone payment for Engineer ERP",
          amount: amountInCentavos,
          quantity: 1,
          currency: currency,
          // images: ["https://example.com/image.png"] // optional
        }
      ]
    }
  }
});


  const auth = Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64');

  const options = {
    hostname: 'api.paymongo.com',
    path: '/v1/checkout_sessions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const request = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        const json = JSON.parse(data);
        res.status(201).json({
          checkout_url: json.data.attributes.checkout_url,
          id: json.data.id,
          client_key: json.data.attributes.client_key,
        });
      } else {
        res.status(response.statusCode).json({
          message: 'Failed to create checkout session',
          error: data,
        });
      }
    });
  });

  request.on('error', (error) => {
    console.error('Request error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  });

  request.write(postData);
  request.end();
}

module.exports = { createPaymentIntent, createCheckoutSession };