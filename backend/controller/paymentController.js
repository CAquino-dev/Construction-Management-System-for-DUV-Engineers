const https = require('https');
const db = require("../config/db");

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
  try {
    const { schedule_id, milestone_name, amount, project_name, client_id, contract_id } = req.body;

    // ✅ Validate inputs
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid or missing amount' });
    }
    if (!schedule_id || !contract_id || !client_id) {
      return res.status(400).json({ message: 'Missing required metadata fields' });
    }

    const amountInCentavos = Math.round(parseFloat(amount) * 100);

    // ✅ Build the PayMongo payload
    const postData = JSON.stringify({
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: 'PHP',
          description: `Payment for ${milestone_name} - ${project_name}`,
          payment_method_types: ['card', 'gcash'],
          success_url: `${process.env.FRONTEND_URL}/clientDashboard/projects-client`,
          cancel_url: `${process.env.FRONTEND_URL}/clientDashboard/projects-client`,
          line_items: [
            {
              name: milestone_name || 'Project Payment',
              description: project_name || 'Construction Project Payment',
              amount: amountInCentavos,
              currency: 'PHP',
              quantity: 1,
            },
          ],
          // ✅ Include metadata for webhook tracking
          metadata: {
            payment_schedule_id: schedule_id,
            contract_id,
            client_id,
            project_name,
            milestone_name,
          },
        },
      },
    });

    // ✅ Build the HTTPS request options
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

    // ✅ Send request to PayMongo
    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => (data += chunk));

      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (response.statusCode >= 200 && response.statusCode < 300) {
            res.status(201).json({
              checkout_url: json.data.attributes.checkout_url,
              session_id: json.data.id,
              client_key: json.data.attributes.client_key,
            });
          } else {
            res.status(response.statusCode).json({
              message: 'Failed to create checkout session',
              error: json,
            });
          }
        } catch (err) {
          console.error('Response parsing error:', err);
          res.status(500).json({ message: 'Failed to parse PayMongo response' });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    });

    request.write(postData);
    request.end();
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Unexpected server error', error: error.message });
  }
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

  db.query(
    "SELECT id, total_amount, contract_signed_at, payment_term_id, start_date, end_date FROM contracts WHERE id = ? AND status = 'signed'",
    [contractId],
    (err, contractRows) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (contractRows.length === 0)
        return res.status(404).json({ message: "Contract not found or not signed" });

      const contract = contractRows[0];

      if (!contract.start_date || !contract.end_date)
        return res.status(400).json({ message: "Contract missing start/end date" });

      db.query(
        "SELECT * FROM payment_term_rules WHERE payment_term_id = ? ORDER BY sequence ASC",
        [contract.payment_term_id],
        (err, rules) => {
          if (err) return res.status(500).json({ message: "Database error" });
          if (rules.length === 0)
            return res.status(400).json({ message: "No payment rules found" });

          let scheduleRows = [];

          for (const rule of rules) {
            if (rule.milestone_name.toLowerCase().includes("monthly")) {
              // 🔹 Calculate number of months
              const start = new Date(contract.start_date);
              const end = new Date(contract.end_date);
              const months =
                (end.getFullYear() - start.getFullYear()) * 12 +
                (end.getMonth() - start.getMonth()) +
                1;

              const percentPerMonth = 100 / months;
              const amountPerMonth = (contract.total_amount / months);

              for (let i = 0; i < months; i++) {
                const dueDate = new Date(start);
                dueDate.setMonth(start.getMonth() + i);

                scheduleRows.push([
                  contract.id,
                  rule.id,
                  `Month ${i + 1} Payment`,
                  dueDate.toISOString().slice(0, 10),
                  amountPerMonth,
                ]);
              }
            } else {
              // fallback for non-monthly
              const amount = (contract.total_amount * rule.percentage) / 100;
              scheduleRows.push([
                contract.id,
                rule.id,
                rule.milestone_name,
                contract.end_date,
                amount,
              ]);
            }
          }

          // ✅ Insert into DB
          db.query(
            "INSERT INTO payment_schedule (contract_id, rule_id, milestone_name, due_date, amount) VALUES ?",
            [scheduleRows],
            (err) => {
              if (err) return res.status(500).json({ message: "Database error" });

              res.json({
                message: "Payment schedule generated (time-based)",
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