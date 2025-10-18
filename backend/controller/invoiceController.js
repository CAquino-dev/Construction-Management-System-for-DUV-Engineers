const db = require("../config/db");
const nodemailer = require("nodemailer");
const axios = require("axios");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

function generateInvoiceNumber(lastNumber) {
  const year = new Date().getFullYear();
  const nextNumber = (lastNumber || 0) + 1;
  return `INV-${year}-${String(nextNumber).padStart(4, "0")}`;
}

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

      // 3. Insert invoice first
      const insertInvoice = `
        INSERT INTO invoices
        (contract_id, payment_schedule_id, invoice_number, amount, status, created_at)
        VALUES (?, ?, ?, ?, 'Sent', NOW())
      `;
      db.query(
        insertInvoice,
        [contractId, schedule.schedule_id, invoiceNumber, schedule.amount],
        (insertErr, result) => {
          if (insertErr) return res.status(500).json({ error: "Failed to save invoice" });

          const invoiceId = result.insertId;

          // 4. Create PayMongo Checkout Session with both invoice_id and payment_schedule_id in metadata
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
                  metadata: {
                    invoice_id: invoiceId,            // used in webhook
                    payment_schedule_id: schedule.schedule_id,  // ✅ added
                    contract_id: contractId,
                  },
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

            // 5. Update invoice with checkout session info
            const updateInvoice = `
              UPDATE invoices
              SET paymongo_checkout_url = ?, paymongo_checkout_session_id = ?
              WHERE id = ?
            `;
            db.query(updateInvoice, [checkoutUrl, checkoutSessionId, invoiceId], (updateErr) => {
              if (updateErr) return res.status(500).json({ error: "Failed to update invoice with PayMongo details" });

              // 6. Send invoice email
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
                  console.error("❌ Failed to send email:", mailErr);
                  return res.status(500).json({ error: "Failed to send invoice email" });
                }

                res.status(200).json({
                  message: "Invoice created and sent to client",
                  invoiceUrl: checkoutUrl,
                  invoiceNumber,
                });
              });
            });
          })
          .catch((apiErr) => {
            console.error("❌ PayMongo API error:", apiErr.response?.data || apiErr.message);
            res.status(500).json({ error: "Failed to create PayMongo checkout session" });
          });
        }
      );
    });
  });
};

module.exports = { sendInvoiceForNextSchedule };
