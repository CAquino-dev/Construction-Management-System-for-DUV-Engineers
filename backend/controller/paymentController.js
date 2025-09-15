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

function createInitialPayment(req, res) {
  const { contractId } = req.body;

  if (!contractId) {
    return res.status(400).json({ message: "Contract ID is required" });
  }

  // 1. Get contract info
  const contractQuery = `SELECT id, total_amount FROM contracts WHERE id = ?`;

  db.query(contractQuery, [contractId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!results.length) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const contract = results[0];
    const downpaymentAmount = parseFloat(contract.total_amount) * 0.3; // 30% downpayment
    const amountInCentavos = Math.round(downpaymentAmount * 100);

    // 2. Create PayMongo Checkout Session
    const postData = JSON.stringify({
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: "PHP",
          description: `Downpayment for Contract #${contract.id}`,
          payment_method_types: ["card", "gcash"],
          success_url: "http://localhost:5173/payment/success",
          cancel_url: "http://localhost:5173/payment/cancel",
          line_items: [
            {
              name: "Contract Downpayment",
              description: "30% project downpayment",
              amount: amountInCentavos,
              quantity: 1,
              currency: "PHP",
            },
          ],
        },
      },
    });

    const auth = Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64");

    const options = {
      hostname: "api.paymongo.com",
      path: "/v1/checkout_sessions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const request = https.request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          const json = JSON.parse(data);
          const checkoutUrl = json.data.attributes.checkout_url;
          const paymongoId = json.data.id;

          // 3. Save to MySQL (status must match enum, use 'Pending')
          const insertQuery = `
            INSERT INTO payments 
              (contract_id, amount, due_date, status, payment_method, transaction_id, reference_no, remarks) 
            VALUES (?, ?, CURDATE(), 'Pending', 'Online', ?, ?, ?)
          `;
          db.query(
            insertQuery,
            [
              contractId,
              downpaymentAmount,
              paymongoId, // transaction_id
              paymongoId, // reference_no (can refine later)
              "Initial downpayment (30%)",
            ],
            (insertErr, result) => {
              if (insertErr) {
                console.error("Insert error:", insertErr);
                return res.status(500).json({ message: "Failed to save payment" });
              }

              res.status(201).json({
                paymentId: result.insertId,
                checkout_url: checkoutUrl,
                contractId,
                amount: downpaymentAmount,
              });
            }
          );
        } else {
          console.error("PayMongo Error:", data);
          res.status(response.statusCode).json({
            message: "Failed to create checkout session",
            error: data,
          });
        }
      });
    });

    request.on("error", (error) => {
      console.error("Request error:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    });

    request.write(postData);
    request.end();
  });
}



module.exports = { createPaymentIntent, createCheckoutSession, createInitialPayment };