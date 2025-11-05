const db = require("../config/db");

// const handlePayMongoWebhook = (req, res) => {
//   const event = req.body;

//   console.log("===== Received PayMongo webhook =====");
//   console.log("Event payload:", JSON.stringify(event, null, 2));
//   console.log("===================================");

//   try {
//     // Extract event type
//     const eventType = event?.data?.attributes?.type;
//     const paymentData = event?.data?.attributes?.data;
//     const paymentId = paymentData?.id; // pay_xxx
//     const amount = paymentData?.attributes?.amount; // in centavos
//     const description = paymentData?.attributes?.description;

//     console.log(`🔔 Handling event: ${eventType}, Payment ID: ${paymentId}, Amount: ${amount}`);

//     if (eventType === "payment.paid") {
//       // Step 1: Try to find invoice by paymongo_payment_id
//       const findInvoiceQuery = `SELECT * FROM invoices WHERE paymongo_payment_id = ? LIMIT 1`;
//       db.query(findInvoiceQuery, [paymentId], (err, invoiceResults) => {
//         if (err) {
//           console.error("❌ DB error in invoice lookup:", err);
//           return res.sendStatus(500);
//         }

//         if (invoiceResults.length > 0) {
//           const invoice = invoiceResults[0];
//           console.log("✅ Invoice found by paymentId:", invoice);

//           // Mark invoice as Paid
//           const updateInvoiceQuery = `UPDATE invoices SET status = 'Paid', updated_at = NOW() WHERE id = ?`;
//           db.query(updateInvoiceQuery, [invoice.id], (err) => {
//             if (err) console.error("❌ Error updating invoice status:", err);
//           });

//           // Also update payment_schedule
//           const updateScheduleQuery = `
//             UPDATE payment_schedule 
//             SET status = 'Paid', updated_at = NOW()
//             WHERE contract_id = ? AND amount = ? AND status != 'Paid'
//             LIMIT 1
//           `;
//           db.query(updateScheduleQuery, [invoice.contract_id, invoice.amount], (err) => {
//             if (err) console.error("❌ Error updating payment_schedule:", err);
//           });

//           // Update contract if all schedules are paid
//           const checkSchedulesQuery = `
//             SELECT COUNT(*) AS remaining 
//             FROM payment_schedule 
//             WHERE contract_id = ? AND status != 'Paid'
//           `;
//           db.query(checkSchedulesQuery, [invoice.contract_id], (err, rows) => {
//             if (err) return console.error("❌ Error checking schedules:", err);

//             if (rows[0].remaining === 0) {
//               const updateContractQuery = `UPDATE contracts SET status = 'Completed', updated_at = NOW() WHERE id = ?`;
//               db.query(updateContractQuery, [invoice.contract_id], (err) => {
//                 if (err) console.error("❌ Error marking contract completed:", err);
//                 else console.log(`🎉 Contract #${invoice.contract_id} marked as Completed!`);
//               });
//             }
//           });

//           console.log(`✅ Payment handled successfully for invoice #${invoice.id}`);
//           return res.sendStatus(200);
//         } else {
//           // Step 2: Fallback by amount (only if amount is valid)
//           if (!amount || isNaN(amount)) {
//             console.warn("⚠️ Skipping fallback: invalid amount", amount);
//             return res.sendStatus(200);
//           }

//           console.warn(`⚠️ No invoice found for paymentId=${paymentId}, trying fallback by amount...`);
//           const fallbackQuery = `SELECT * FROM invoices WHERE status = 'Sent' AND amount = ? LIMIT 1`;
//           db.query(fallbackQuery, [amount], (err, results) => {
//             if (err) {
//               console.error("❌ Error in fallback lookup:", err);
//               return res.sendStatus(500);
//             }

//             if (results.length > 0) {
//               const invoice = results[0];
//               console.log("✅ Fallback invoice found by amount:", invoice);

//               const updateInvoiceQuery = `UPDATE invoices SET status = 'Paid', paymongo_payment_id = ?, updated_at = NOW() WHERE id = ?`;
//               db.query(updateInvoiceQuery, [paymentId, invoice.id], (err) => {
//                 if (err) console.error("❌ Error updating invoice in fallback:", err);
//               });

//               console.log(`✅ Payment handled via fallback for invoice #${invoice.id}`);
//             } else {
//               console.warn("⚠️ No matching invoice found even with fallback.");
//             }

//             return res.sendStatus(200);
//           });
//         }
//       });
//     } else {
//       console.log(`ℹ️ Ignored event type: ${eventType}`);
//       return res.sendStatus(200);
//     }
//   } catch (err) {
//     console.error("❌ Unexpected error in webhook handler:", err);
//     return res.sendStatus(500);
//   }
// };

const handlePayMongoWebhook = (req, res) => {
  const event = req.body;

  console.log("===== Received PayMongo webhook =====");
  console.log("Event payload:", JSON.stringify(event, null, 2));
  console.log("===================================");

  const eventType = event.data?.attributes?.type;
  const paymentData = event.data?.attributes?.data;
  const paymentId = paymentData?.id;
  const attributes = paymentData?.attributes;
  const metadata = attributes?.metadata || {};

  const invoiceId = metadata.invoice_id;
  const paymentScheduleId = metadata.payment_schedule_id;

  // Convert amount (PayMongo sends in cents)
  const amount = attributes?.amount ? attributes.amount / 100 : 0;
  const channel = attributes?.channel || "online";
  const referenceNumber = attributes?.source?.reference_number || null;
  const bankName = attributes?.source?.bank || null;
  const accountNumber = null; // PayMongo doesn't provide this
  const transactionDate = attributes?.paid_at
    ? new Date(attributes.paid_at)
    : new Date();

  console.log(
    `🔔 Event: ${eventType}, Payment ID: ${paymentId}, Invoice ID: ${invoiceId}, Schedule ID: ${paymentScheduleId}, Channel: ${channel}, Amount: ${amount}`
  );

  // Only handle successful payments
  if (eventType === "payment.paid") {
    // ✅ 1. Update invoice if it exists
    if (invoiceId) {
      const updateInvoiceQuery = `
        UPDATE invoices
        SET status = 'Paid',
            paymongo_payment_id = ?,
            paid_at = NOW()
        WHERE id = ?
      `;
      db.query(updateInvoiceQuery, [paymentId, invoiceId], (err) => {
        if (err) {
          console.error("❌ Failed to update invoice:", err);
        } else {
          console.log(`✅ Invoice ${invoiceId} marked as Paid`);
        }
      });
    }

    // ✅ 2. Update payment schedule if it exists
    if (paymentScheduleId) {
      const updateScheduleQuery = `
        UPDATE payment_schedule
        SET status = 'Paid',
            paid_date = NOW()
        WHERE id = ?
      `;
      db.query(updateScheduleQuery, [paymentScheduleId], (err) => {
        if (err) {
          console.error("❌ Failed to update payment schedule:", err);
        } else {
          console.log(`✅ Payment Schedule ${paymentScheduleId} marked as Paid`);
        }
      });
    }

    // ✅ 3. Insert into finance_payments
    const insertFinancePaymentQuery = `
      INSERT INTO finance_payments
        (payment_type, reference_id, payment_method, reference_number, bank_name, account_number, transaction_date, amount, notes, processed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const paymentType = invoiceId
      ? "invoice"
      : paymentScheduleId
      ? "client payment"
      : "other";
    const referenceId = invoiceId || paymentScheduleId || null;
    const notes = `PayMongo payment ID: ${paymentId}, Channel: ${channel}`;

    db.query(
      insertFinancePaymentQuery,
      [
        paymentType,
        referenceId,
        "Online", // ✅ always "Online" since it's PayMongo
        referenceNumber,
        bankName,
        accountNumber,
        transactionDate,
        amount,
        notes,
        null, // processed_by (null = automated system)
      ],
      (err) => {
        if (err) {
          console.error("❌ Failed to insert into finance_payments:", err);
          return res.sendStatus(500);
        }
        console.log("✅ Finance payment recorded successfully");
        return res.sendStatus(200);
      }
    );
  } else {
    console.log("ℹ️ Non-payment event received, ignoring...");
    res.sendStatus(200);
  }
};



const handlePayMongoFeasibilityWebhook = (req, res) => {
  const event = req.body;

  console.log("===== Received PayMongo Feasibility Webhook =====");
  console.log("Event payload:", JSON.stringify(event, null, 2));
  console.log("===============================================");

  const eventType = event.data?.attributes?.type;
  const paymentData = event.data?.attributes?.data;
  const paymentId = paymentData?.id; // pay_xxx
  const metadata = paymentData?.attributes?.metadata;
  const feasibilityId = metadata?.feasibility_id; // 💡 this is the key difference

  console.log(`🔔 Event: ${eventType}, Payment ID: ${paymentId}, Feasibility ID: ${feasibilityId}`);

  if (eventType === "payment.paid" && feasibilityId) {
    const updateFeasibilityQuery = `
      UPDATE feasibility_study_payments
      SET status = 'Paid',
          paymongo_payment_id = ?,
          paid_at = NOW()
      WHERE id = ?
    `;

    db.query(updateFeasibilityQuery, [paymentId, feasibilityId], (err) => {
      if (err) {
        console.error("❌ Failed to update feasibility payment:", err);
        return res.sendStatus(500);
      }

      console.log(`✅ Feasibility payment ${feasibilityId} marked as Paid`);
      return res.sendStatus(200);
    });
  } else if (eventType === "payment.failed" && feasibilityId) {
    const failQuery = `
      UPDATE feasibility_study_payments
      SET status = 'Failed',
          updated_at = NOW()
      WHERE id = ?
    `;
    db.query(failQuery, [feasibilityId], (err) => {
      if (err) {
        console.error("❌ Failed to mark feasibility as failed:", err);
        return res.sendStatus(500);
      }

      console.log(`❌ Feasibility payment ${feasibilityId} marked as Failed`);
      return res.sendStatus(200);
    });
  } else {
    res.sendStatus(200); // ignore other events
  }
};




module.exports = { handlePayMongoWebhook };