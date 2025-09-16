const https = require('https');
const db = require("../config/db");

// const PAYMONGO_SECRET_KEY = 'sk_test_JgUY3ATdxSYcTADVGssDXLYS'; // Replace with your actual secret key

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

  const auth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64');

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


  const auth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64');

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

  // 1. Get contract's payment term
  const contractQuery = `
    SELECT c.id AS contract_id, c.payment_term_id
    FROM contracts c
    WHERE c.id = ?
  `;

  db.query(contractQuery, [contractId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!results.length) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const paymentTermId = results[0].payment_term_id;

    // 2. Get first payment by sort_order = 1 for this contract
    const firstPaymentQuery = `
      SELECT p.id, p.amount, p.due_date, p.remarks
      FROM payments p
      JOIN payment_schedule ps ON ps.payment_term_id = ?
        AND ps.milestone_name = p.remarks
      WHERE p.contract_id = ? AND p.status = 'Pending'
      ORDER BY ps.sort_order ASC
      LIMIT 1
    `;

    db.query(firstPaymentQuery, [paymentTermId, contractId], (err2, paymentResults) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ message: "Failed to fetch first payment" });
      }

      if (!paymentResults.length) {
        return res.status(404).json({ message: "No pending payments found for this contract" });
      }

      const payment = paymentResults[0];
      const amountInCentavos = Math.round(parseFloat(payment.amount) * 100);

      // 3. Create PayMongo Checkout Session
      const postData = JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            currency: "PHP",
            description: `Payment for Contract #${contractId}: ${payment.remarks}`,
            payment_method_types: ["card", "gcash"],
            success_url: "http://localhost:5173/payment/success",
            cancel_url: "http://localhost:5173/payment/cancel",
            line_items: [
              {
                name: payment.remarks,
                description: payment.remarks,
                amount: amountInCentavos,
                quantity: 1,
                currency: "PHP",
              },
            ],
          },
        },
      });

      const auth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64");

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

            // 4. Update payment row
            const updateQuery = `
              UPDATE payments
              SET transaction_id = ?, reference_no = ?, payment_method = 'Online'
              WHERE id = ?
            `;

            db.query(updateQuery, [paymongoId, paymongoId, payment.id], (updateErr) => {
              if (updateErr) {
                console.error("Failed to update payment:", updateErr);
                return res.status(500).json({ message: "Failed to update payment record" });
              }

              res.status(201).json({
                paymentId: payment.id,
                checkout_url: checkoutUrl,
                contractId,
                amount: payment.amount,
              });
            });
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
  });
}




module.exports = { createPaymentIntent, createCheckoutSession, createInitialPayment };