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
                    <html>
                  <head>
                      <meta charset="UTF-8">
                      <style>
                          body {
                              font-family: 'Arial', sans-serif;
                              line-height: 1.6;
                              color: #333;
                              max-width: 600px;
                              margin: 0 auto;
                              padding: 20px;
                          }
                          .header {
                              background-color: #4c735c;
                              color: white;
                              padding: 20px;
                              text-align: center;
                              border-radius: 8px 8px 0 0;
                          }
                          .content {
                              background-color: #f9f9f9;
                              padding: 25px;
                              border-radius: 0 0 8px 8px;
                          }
                          .invoice-details {
                              background-color: white;
                              border-left: 4px solid #4c735c;
                              padding: 15px;
                              margin: 20px 0;
                              border-radius: 4px;
                          }
                          .payment-button {
                              display: inline-block;
                              background-color: #4c735c;
                              color: white;
                              padding: 12px 30px;
                              text-decoration: none;
                              border-radius: 5px;
                              font-weight: bold;
                              margin: 15px 0;
                          }
                          .payment-options {
                              background-color: #e8f5e8;
                              border: 1px solid #4c735c;
                              padding: 20px;
                              margin: 20px 0;
                              border-radius: 8px;
                          }
                          .footer {
                              text-align: center;
                              margin-top: 25px;
                              padding-top: 20px;
                              border-top: 1px solid #ddd;
                              color: #666;
                              font-size: 14px;
                          }
                          .amount {
                              font-size: 24px;
                              font-weight: bold;
                              color: #2c5530;
                          }
                          .due-date {
                              color: #d9534f;
                              font-weight: bold;
                          }
                          .option-title {
                              color: #4c735c;
                              font-weight: bold;
                              margin-bottom: 10px;
                          }
                      </style>
                  </head>
                  <body>
                      <div class="header">
                          <h1>💰 Payment Request</h1>
                      </div>
                      
                      <div class="content">
                          <p>Dear ${schedule.client_name},</p>
                          
                          <p>This is a friendly reminder regarding your upcoming payment for the construction project.</p>
                          
                          <div class="invoice-details">
                              <h3>Invoice Details:</h3>
                              <p><strong>Amount Due:</strong> <span class="amount">₱${parseFloat(schedule.amount).toLocaleString()}</span></p>
                              <p><strong>Due Date:</strong> <span class="due-date">${new Date(schedule.due_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                          </div>

                          <div class="payment-options">
                              <h3 class="option-title">💳 Payment Options</h3>
                              
                              <p><strong>Option 1: Online Payment (Recommended)</strong></p>
                              <p>Pay securely online using the link below:</p>
                              <div style="text-align: center;">
                                  <a href="${checkoutUrl}" class="payment-button">
                                      💳 Pay Invoice Online
                                  </a>
                              </div>

                              <p style="margin-top: 20px;"><strong>Option 2: In-Person Payment</strong></p>
                              <p>You can also pay in person at our office:</p>
                              <p>
                                  <strong>DUV Engineers Office</strong><br>
                                  [Your Office Address]<br>
                                  [City, Province, Zip Code]<br>
                                  📞 [Your Phone Number]
                              </p>
                              <p><strong>Office Hours:</strong><br>
                                  Monday - Friday: 8:00 AM - 5:00 PM<br>
                                  Saturday: 9:00 AM - 12:00 PM<br>
                                  <em>Closed on Sundays and holidays</em>
                              </p>
                              <p>Please bring this invoice reference (#${contractId}) when making your payment.</p>
                          </div>

                          <p><strong>Important:</strong> Please ensure payment is made by the due date to avoid any delays in your project timeline.</p>
                          
                          <p>If you have already made this payment, please disregard this email. For any questions or concerns regarding this invoice, please don't hesitate to contact our finance department.</p>
                          
                          <p>Thank you for your prompt attention to this matter.</p>
                      </div>
                      
                      <div class="footer">
                          <p>Best regards,<br>
                          <strong>DUV Engineers Team</strong></p>
                          <p>📞 Contact: [Your Phone Number]<br>
                          📧 Email: [Your Email Address]<br>
                          📍 Address: [Your Office Address]</p>
                          <p style="font-size: 12px; color: #999;">
                              This is an automated email. Please do not reply to this message.
                          </p>
                      </div>
                  </body>
                  </html>
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
