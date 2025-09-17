const db = require("../config/db");
const nodemailer = require("nodemailer");
const axios = require("axios");
const cron = require("node-cron");

// ---------------------
// Email Transporter
// ---------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

// ---------------------
// Helper: Generate Invoice Number
// ---------------------
function generateInvoiceNumber(lastNumber) {
  const year = new Date().getFullYear();
  const nextNumber = (lastNumber || 0) + 1;
  return `INV-${year}-${String(nextNumber).padStart(4, "0")}`;
}

// ---------------------
// Send Invoice Endpoint
// ---------------------
const sendInvoiceForNextSchedule = (req, res) => {
  const { contractId } = req.body;

  // 1. Get next unpaid schedule
  const scheduleQuery = `
    SELECT ps.id AS schedule_id, ps.amount, ps.due_date, ps.status,
           c.total_amount, l.email, l.client_name,
           ptr.sequence
    FROM payment_schedule ps
    JOIN contracts c ON ps.contract_id = c.id
    JOIN leads l ON c.lead_id = l.id
    JOIN payment_term_rules ptr ON ps.rule_id = ptr.id
    WHERE ps.contract_id = ? AND ps.status = 'Pending'
    ORDER BY ptr.sequence ASC
    LIMIT 1
  `;

  db.query(scheduleQuery, [contractId], (err, schedules) => {
    if (err) return res.status(500).json({ error: "DB error fetching schedule" });
    if (!schedules.length) return res.status(404).json({ error: "No pending schedule found" });

    const schedule = schedules[0];

    // 2. Get last invoice number
    db.query("SELECT MAX(id) AS lastId FROM invoices", (err2, lastInv) => {
      if (err2) return res.status(500).json({ error: "DB error fetching last invoice" });

      const invoiceNumber = generateInvoiceNumber(lastInv[0].lastId);

      // 3. Create PayMongo checkout session
      axios.post(
        "https://api.paymongo.com/v1/checkout_sessions",
        {
          data: {
            attributes: {
              amount: schedule.amount * 100,
              currency: "PHP",
              description: `Invoice ${invoiceNumber} for Contract #${contractId}`,
              line_items: [
                {
                  name: `Contract #${contractId} - ${invoiceNumber}`,
                  amount: schedule.amount * 100,
                  currency: "PHP",
                  quantity: 1,
                },
              ],
              payment_method_types: ["gcash", "paymaya", "card"],
              success_url: `${process.env.FRONTEND_URL}/payment/success`,
              cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
            },
          },
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((paymongoRes) => {
        const checkoutUrl = paymongoRes.data.data.attributes.checkout_url;
        const checkoutSessionId = paymongoRes.data.data.id;

        // 4. Insert invoice record with checkout session ID
        const insertInvoice = `
          INSERT INTO invoices
          (contract_id, payment_schedule_id, invoice_number, paymongo_checkout_url, paymongo_checkout_session_id, amount, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'Sent', NOW())
        `;
        db.query(
          insertInvoice,
          [contractId, schedule.schedule_id, invoiceNumber, checkoutUrl, checkoutSessionId, schedule.amount],
          (insertErr) => {
            if (insertErr) return res.status(500).json({ error: "Failed to save invoice" });

            // 5. Send email to client
            const mailOptions = {
              from: process.env.SMTP_EMAIL,
              to: schedule.email,
              subject: `Invoice ${invoiceNumber} - Contract #${contractId}`,
              html: `
                <p>Hi ${schedule.client_name},</p>
                <p>Please pay your invoice for Contract #${contractId}:</p>
                <p>Amount due: ₱${parseFloat(schedule.amount).toLocaleString()}</p>
                <p>Due date: ${new Date(schedule.due_date).toLocaleDateString()}</p>
                <p><a href="${checkoutUrl}">Click here to pay now</a></p>
              `,
            };

            transporter.sendMail(mailOptions, (mailErr) => {
              if (mailErr) {
                console.error("Failed to send email:", mailErr);
                return res.status(500).json({ error: "Failed to send invoice email" });
              }

              res.status(200).json({
                message: "Invoice created and sent to client",
                invoiceUrl: checkoutUrl,
                invoiceNumber,
              });
            });
          }
        );
      })
      .catch((apiErr) => {
        console.error("PayMongo API error:", apiErr.response?.data || apiErr.message);
        res.status(500).json({ error: "Failed to create PayMongo checkout session" });
      });
    });
  });
};

// ---------------------
// Poll Payments Function
// ---------------------
async function pollPayments() {
  console.log("=== Starting payment polling ===");

  // Get invoices that are Sent or Pending
  db.query(
    "SELECT id, paymongo_payment_id, paymongo_checkout_session_id, payment_schedule_id, contract_id FROM invoices WHERE status IN ('Sent','Pending')",
    async (err, invoices) => {
      if (err) return console.error("DB Error fetching invoices:", err);

      if (!invoices.length) {
        console.log("No invoices to poll.");
        return;
      }

      console.log(`Found ${invoices.length} invoices to poll.`);

      for (const invoice of invoices) {
        console.log(`\nProcessing invoice ID: ${invoice.id}`);
        try {
          let paymentId = invoice.paymongo_payment_id;

          // If no payment ID yet, fetch from checkout session
          if (!paymentId) {
            console.log(`No payment ID yet. Fetching from checkout session ${invoice.paymongo_checkout_session_id}...`);

            const sessionRes = await axios.get(
              `https://api.paymongo.com/v1/checkout_sessions/${invoice.paymongo_checkout_session_id}`,
              {
                headers: {
                  Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
                },
              }
            );

            paymentId = sessionRes.data.data.attributes.payment;

            if (paymentId) {
              console.log(`Payment ID ${paymentId} retrieved from checkout session.`);

              db.query(
                "UPDATE invoices SET paymongo_payment_id = ?, status = 'Pending' WHERE id = ?",
                [paymentId, invoice.id],
                (updateErr) => {
                  if (updateErr) console.error("DB Update Error (payment ID):", updateErr);
                  else console.log(`Invoice ${invoice.id} payment ID saved and status set to Pending.`);
                }
              );
            } else {
              console.log("No payment ID created yet. Waiting for customer to initiate payment.");
            }
          }

          // If payment exists, check status
          if (paymentId) {
            console.log(`Checking payment status for payment ID: ${paymentId}`);

            const paymentRes = await axios.get(
              `https://api.paymongo.com/v1/payments/${paymentId}`,
              {
                headers: {
                  Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
                },
              }
            );

            const payment = paymentRes.data.data;
            console.log(`Payment status: ${payment.attributes.status}`);

            if (payment.attributes.status === "paid") {
              console.log("Payment is paid. Updating invoice, schedule, and contract...");

              // Update invoice
              db.query(
                "UPDATE invoices SET status = 'Paid', paid_at = NOW() WHERE id = ?",
                [invoice.id],
                (invErr) => {
                  if (invErr) console.error("Invoice update error:", invErr);
                  else console.log(`Invoice ${invoice.id} marked as Paid.`);
                }
              );

              // Update payment schedule
              db.query(
                "UPDATE payment_schedule SET status = 'Paid', paid_date = NOW() WHERE id = ?",
                [invoice.payment_schedule_id],
                (schedErr) => {
                  if (schedErr) console.error("Payment schedule update error:", schedErr);
                  else console.log(`Payment schedule ${invoice.payment_schedule_id} marked as Paid.`);
                }
              );

              // Update contract's paid amount
              db.query(
                "UPDATE contracts SET paid_amount = paid_amount + ? WHERE id = ?",
                [payment.attributes.amount / 100, invoice.contract_id],
                (contractErr) => {
                  if (contractErr) console.error("Contract update error:", contractErr);
                  else console.log(`Contract ${invoice.contract_id} paid_amount updated.`);
                }
              );
            } else {
              console.log("Payment is not paid yet. Waiting...");
            }
          }
        } catch (err) {
          console.error("Polling error:", err.response?.data || err.message);
        }
      }

      console.log("=== Payment polling finished ===\n");
    }
  );
}


// ---------------------
// Poller Cron: Run every minute
// ---------------------

// ---------------------
// Export
// ---------------------
module.exports = { sendInvoiceForNextSchedule, pollPayments };
