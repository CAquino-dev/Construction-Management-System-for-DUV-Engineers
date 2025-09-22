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

const generatePaymentSchedule = (req, res) => {
  const { contractId } = req.params;

  // 1. Get contract (with start and end date)
  db.query(
    "SELECT id, total_amount, contract_signed_at, payment_term_id, start_date, end_date FROM contracts WHERE id = ? AND status = 'signed'",
    [contractId],
    (err, contractRows) => {
      if (err) {
        console.error("DB Error (contract):", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (contractRows.length === 0) {
        return res.status(404).json({ message: "Contract not found or not signed" });
      }

      const contract = contractRows[0];

      // Validate dates
      if (!contract.start_date || !contract.end_date) {
        return res.status(400).json({
          message: "Contract does not have valid start or end date",
        });
      }

      // 2. Get payment term rules
      db.query(
        "SELECT * FROM payment_term_rules WHERE payment_term_id = ? ORDER BY sequence ASC",
        [contract.payment_term_id],
        (err, rules) => {
          if (err) {
            console.error("DB Error (rules):", err);
            return res.status(500).json({ message: "Database error" });
          }

          if (rules.length === 0) {
            return res.status(400).json({ message: "No payment rules defined for this contract" });
          }

          // ✅ Validate total percentage = 100
          const totalPercentage = rules.reduce((sum, r) => sum + parseFloat(r.percentage), 0);
          if (Math.abs(totalPercentage - 100) > 0.01) { // allow floating-point tolerance
            return res.status(400).json({
              message: `Invalid payment rules: total percentage = ${totalPercentage}%. It must equal 100%.`,
            });
          }

          // 3. Generate schedule rows
          const scheduleRows = rules.map((rule, index) => {
            let dueDate = null;

            if (index === rules.length - 1) {
              // ✅ Last milestone always at contract end date
              dueDate = contract.end_date;
            } else if (rule.trigger_event === "signing") {
              dueDate = contract.contract_signed_at;
            } else if (rule.trigger_event === "start") {
              dueDate = contract.start_date;
            } else if (rule.trigger_event === "completion") {
              dueDate = contract.end_date;
            } else if (rule.trigger_event === "monthly") {
              const d = new Date(contract.start_date);
              d.setMonth(d.getMonth() + (rule.sequence - 1));
              dueDate = d.toISOString().slice(0, 10);
            }

            const amount = (contract.total_amount * rule.percentage) / 100;

            return [
              contract.id,
              rule.id,
              rule.milestone_name,
              dueDate,
              amount,
            ];
          });

          // 4. Insert schedule into DB
          db.query(
            "INSERT INTO payment_schedule (contract_id, rule_id, milestone_name, due_date, amount) VALUES ?",
            [scheduleRows],
            (err) => {
              if (err) {
                console.error("DB Error (insert schedule):", err);
                return res.status(500).json({ message: "Database error" });
              }

              return res.json({
                message: "Payment schedule generated",
                contractId: contract.id,
                schedule: scheduleRows,
              });
            }
          );
        }
      );
    }
  );
};


module.exports = { createPaymentIntent, createCheckoutSession, createInitialPayment, generatePaymentSchedule };