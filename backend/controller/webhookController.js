const db = require("../config/db");

const handlePayMongoWebhook = (req, res) => {
  const event = req.body;

  console.log("===== Received PayMongo webhook =====");
  console.log("Event type:", event.type);
  console.log("Event data:", JSON.stringify(event.data, null, 2));
  console.log("===================================");

  try {
    const paymentId = event.data.id;
    const amount = event.data.attributes.amount; // smallest currency unit

    if (event.type === "payment.paid") {
      // 1️⃣ Find the invoice by paymongo_payment_id
      const findInvoiceQuery = `SELECT * FROM invoices WHERE paymongo_payment_id = ?`;
      db.query(findInvoiceQuery, [paymentId], (err, invoices) => {
        if (err) {
          console.error("Error finding invoice:", err);
          return res.sendStatus(500);
        }
        if (invoices.length === 0) {
          console.warn(`No invoice found for payment ${paymentId}`);
          return res.sendStatus(404);
        }

        const invoice = invoices[0];

        // 2️⃣ Update invoice
        const updateInvoiceQuery = `
          UPDATE invoices
          SET status = 'Paid', paid_at = NOW()
          WHERE id = ?
        `;
        db.query(updateInvoiceQuery, [invoice.id], (err, result) => {
          if (err) {
            console.error("Error updating invoice:", err);
          } else {
            console.log(`Invoice ${invoice.id} updated as PAID`);
          }
        });

        // 3️⃣ Update contract
        const updateContractQuery = `
          UPDATE contracts
          SET 
            paid_amount = paid_amount + ?,
            payment_status = CASE
              WHEN paid_amount + ? >= total_amount THEN 'Paid'
              WHEN paid_amount + ? > 0 THEN 'Partially Paid'
              ELSE 'Unpaid'
            END
          WHERE id = ?
        `;
        db.query(updateContractQuery, [invoice.amount, invoice.amount, invoice.amount, invoice.contract_id], (err, result) => {
          if (err) {
            console.error("Error updating contract:", err);
          } else {
            console.log(`Contract ${invoice.contract_id} updated for payment ${paymentId}`);
          }
        });

        // 4️⃣ Update payment_schedule
        if (invoice.payment_schedule_id) {
          const updateScheduleQuery = `
            UPDATE payment_schedule
            SET status = 'Paid', paid_date = NOW()
            WHERE id = ?
          `;
          db.query(updateScheduleQuery, [invoice.payment_schedule_id], (err, result) => {
            if (err) {
              console.error("Error updating payment_schedule:", err);
            } else {
              console.log(`Payment schedule ${invoice.payment_schedule_id} updated for payment ${paymentId}`);
            }
          });
        }
      });
    }

    if (event.type === "payment.failed") {
      // Mark invoice as failed
      const updateInvoiceQuery = `
        UPDATE invoices
        SET status = 'Pending'
        WHERE paymongo_payment_id = ?
      `;
      db.query(updateInvoiceQuery, [paymentId], (err, result) => {
        if (err) {
          console.error("Error marking invoice as FAILED:", err);
        } else {
          console.log(`Invoice for payment ${paymentId} marked as FAILED`);
        }
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.sendStatus(500);
  }
};


module.exports = { handlePayMongoWebhook };