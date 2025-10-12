const db = require('../config/db');
const nodemailer = require('nodemailer');
const crypto = require("crypto");

const addSupplier = (req, res) => {
  const {
    supplier_name,
    contact_person,
    email,
    phone,
    address,
    specialization,
    status,
  } = req.body;

  const query = `
    INSERT INTO suppliers 
    (supplier_name, contact_person, email, phone, address, specialization, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      specialization,
      status || "Active",
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting supplier:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err });
      }

      res.status(201).json({
        success: true,
        message: "Supplier added successfully",
        supplierId: results.insertId,
      });
    }
  );
};

const getSuppliers = (req, res) => {

    const query = "SELECT * FROM suppliers ORDER BY created_at DESC";

    db.query(query, (err, results) => {
        if(err){
            console.error('Error fetching suppliers:', error);
            return res.status(500).json({ error: 'Failed to fetch suppliers' });
        };
        res.json(results);
    });
};

const updateSupplier = (req, res) => {
    const { supplierId } = req.params;
    const {
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      specialization,
      status,
    } = req.body;

    const query = `
      UPDATE suppliers SET 
      supplier_name = ?, contact_person = ?, email = ?, phone = ?, 
      address = ?, specialization = ?, status = ? 
      WHERE id = ?
    `;

    db.query(
      query,
      [supplier_name, contact_person, email, phone, address, specialization, status, supplierId], (err, results) => {
     if (err) {
        console.error("Error updating supplier:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err });
      }

      res.status(201).json({
        success: true,
        message: "Supplier updated successfully",
        supplierId: results.insertId,
      });
      });
};

const deleteSupplier = (req, res) => {
  const { supplierId } = req.params;

  const query = `DELETE FROM suppliers WHERE id = ?`;

  db.query(query, [supplierId], (err, result) => {
    if (err) {
      console.error("Error deleting supplier:", err);
      return res.status(500).json({ success: false, message: "Database error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  });
};

// Setup your email transporter (use your SMTP config or service)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",  // replace with your SMTP server
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL, // your email
    pass: process.env.SMTP_PASS,    // your email password or app password
  },
});

const sendQuotationRequests = (req, res) => {
  const { milestoneId, suppliers } = req.body;

  if (!milestoneId || !suppliers || suppliers.length === 0) {
    return res.status(400).json({ message: "Milestone ID and suppliers are required." });
  }

  suppliers.forEach((supplier) => {
    const token = crypto.randomBytes(20).toString("hex");
    const publicLink = `${process.env.FRONTEND_URL}/supplier/quote/${token}`;

    const insertQuoteQuery = `
      INSERT INTO procurement_quotes (milestone_id, supplier_id, quote_token, status, created_at)
      VALUES (?, ?, ?, 'Pending', NOW())
    `;

    db.query(insertQuoteQuery, [milestoneId, supplier.id, token], (err, result) => {
      if (err) {
        console.error("❌ Error inserting quote:", err);
        return;
      }

      const quoteId = result.insertId;

      // 🔹 Fetch all MTO items under this milestone
      const fetchItemsQuery = `
        SELECT mm.description AS material_name, mm.unit, mm.quantity
        FROM milestone_mto mm
        JOIN milestone_boq mb ON mm.milestone_boq_id = mb.id
        WHERE mb.milestone_id = ?
      `;

      db.query(fetchItemsQuery, [milestoneId], (err2, items) => {
        if (err2) {
          console.error("❌ Error fetching MTO items:", err2);
          return;
        }

        if (items.length === 0) {
          console.warn(`⚠️ No MTO items found for milestone ${milestoneId}`);
          return;
        }

        // 🔹 Insert items into procurement_quote_items
        const itemValues = items.map((item) => [
          quoteId,
          item.material_name,
          item.unit,
          item.quantity,
          null, // unit_price will be filled in by supplier later
        ]);

        const insertItemsQuery = `
          INSERT INTO procurement_quote_items (quote_id, material_name, unit, quantity, unit_price)
          VALUES ?
        `;

        db.query(insertItemsQuery, [itemValues], (err3) => {
          if (err3) console.error("❌ Error inserting quote items:", err3);
        });
      });

      // 🔹 Send supplier email
      const mailOptions = {
        from: `"DUV Engineers Procurement" <${process.env.SMTP_EMAIL}>`,
        to: supplier.email,
        subject: "Quotation Request – DUV Engineers",
        text: `Hello ${supplier.name},

We are inviting you to submit a quotation for materials required in our current project milestone.

Please click the link below to view the requested items and submit your quotation:

${publicLink}

Thank you for your partnership.

– DUV Engineers Procurement Team`,
      };

      transporter.sendMail(mailOptions, (mailErr) => {
        if (mailErr) console.error("❌ Error sending email:", mailErr);
      });
    });
  });

  res.status(200).json({ message: "Quotation requests sent to suppliers successfully." });
};

const getQuoteByToken = (req, res) => {
  const { token } = req.params;

  const query = `
    SELECT 
      q.id AS quote_id,
      q.milestone_id,
      q.status,
      q.created_at,
      s.id AS supplier_id,
      s.supplier_name,
      s.email AS supplier_email,
      m.title AS milestone_title,
      m.details AS milestone_details
    FROM procurement_quotes q
    JOIN suppliers s ON q.supplier_id = s.id
    JOIN milestones m ON q.milestone_id = m.id
    WHERE q.quote_token = ?
  `;

  db.query(query, [token], (err, quoteResults) => {
    if (err) {
      console.error("Error fetching quote:", err);
      return res.status(500).json({ message: "Failed to fetch quote details." });
    }

    if (quoteResults.length === 0) {
      return res.status(404).json({ message: "Invalid or expired quote token." });
    }

    const quote = quoteResults[0];

    const itemsQuery = `
      SELECT id, material_name, unit, quantity, unit_price
      FROM procurement_quote_items
      WHERE quote_id = ?
    `;

    db.query(itemsQuery, [quote.quote_id], (err2, items) => {
      if (err2) {
        console.error("Error fetching quote items:", err2);
        return res.status(500).json({ message: "Failed to fetch quote items." });
      }

      return res.status(200).json({
        quote: {
          id: quote.quote_id,
          milestone_id: quote.milestone_id,
          milestone_title: quote.milestone_title,
          milestone_details: quote.milestone_details,
          supplier_name: quote.supplier_name,
          supplier_email: quote.supplier_email,
          status: quote.status,
          created_at: quote.created_at,
          items,
        },
      });
    });
  });
};

const submitSupplierQuote = (req, res) => {
  const { token } = req.params;
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ message: "Items array is required." });
  }

  const findQuery = `SELECT id, status FROM procurement_quotes WHERE quote_token = ?`;

  db.query(findQuery, [token], (err, results) => {
    if (err) {
      console.error("Error finding quote:", err);
      return res.status(500).json({ message: "Failed to find quote." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Invalid quote token." });
    }

    const quote = results[0];

    if (quote.status !== "Pending") {
      return res.status(400).json({ message: "This quote has already been submitted." });
    }

    // Update each item's price one by one
    let completed = 0;
    let hasError = false;

    items.forEach((item) => {
      const updateQuery = `
        UPDATE procurement_quote_items
        SET unit_price = ?
        WHERE id = ? AND quote_id = ?
      `;

      db.query(updateQuery, [item.unit_price, item.id, quote.id], (err2) => {
        if (err2) {
          console.error("Error updating item:", err2);
          hasError = true;
        }

        completed++;

        if (completed === items.length) {
          if (hasError) {
            return res.status(500).json({ message: "Error updating one or more items." });
          }

          // Mark the quote as submitted after all updates
          const updateQuoteStatus = `
            UPDATE procurement_quotes
            SET status = 'Submitted'
            WHERE id = ?
          `;

          db.query(updateQuoteStatus, [quote.id], (err3) => {
            if (err3) {
              console.error("Error updating quote status:", err3);
              return res.status(500).json({ message: "Failed to update quote status." });
            }

            return res.status(200).json({ message: "Quotation submitted successfully!" });
          });
        }
      });
    });
  });
};

// GET /api/procurement/quotes/submitted
const getSubmittedQuotes = (req, res) => {
  const query = `
    SELECT pq.id AS quote_id, pq.milestone_id, pq.supplier_id, s.name AS supplier_name,
           pq.status, pq.created_at, m.title AS milestone_title
    FROM procurement_quotes pq
    JOIN suppliers s ON pq.supplier_id = s.id
    JOIN milestones m ON pq.milestone_id = m.id
    WHERE pq.status = 'Submitted'
    ORDER BY pq.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching submitted quotes:", err);
      return res.status(500).json({ message: "Failed to fetch submitted quotes." });
    }
    res.json({ quotes: results });
  });
};

const getMilestonesWithQuotes = (req, res) => {
  const query = `
    SELECT DISTINCT m.id AS milestone_id, m.title AS milestone_name
    FROM milestones m
    JOIN procurement_quotes pq ON pq.milestone_id = m.id
    ORDER BY m.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching milestones:", err);
      return res.status(500).json({ message: "Failed to fetch milestones." });
    }

    res.json(results);
  });
};

// GET /api/procurement/quotes/milestone/:milestoneId
const getQuotesByMilestone = (req, res) => {
  const { milestoneId } = req.params;

  const query = `
    SELECT 
      pq.id AS quote_id,
      pq.status,
      s.supplier_name,
      pqi.material_name,
      pqi.unit,
      pqi.quantity,
      pqi.unit_price
    FROM procurement_quotes pq
    JOIN suppliers s ON pq.supplier_id = s.id
    JOIN procurement_quote_items pqi ON pq.id = pqi.quote_id
    WHERE pq.milestone_id = ?
    ORDER BY s.supplier_name, pqi.material_name
  `;

  db.query(query, [milestoneId], (err, results) => {
    if (err) {
      console.error("Error fetching quotes:", err);
      return res.status(500).json({ message: "Failed to fetch quotes." });
    }

    // ✅ Group by supplier
    const grouped = {};
    results.forEach((row) => {
      if (!grouped[row.supplier_name]) grouped[row.supplier_name] = [];
      grouped[row.supplier_name].push({
        quote_id: row.quote_id, // <--- this was missing
        status: row.status,
        material_name: row.material_name,
        unit: row.unit,
        quantity: row.quantity,
        unit_price: row.unit_price,
      });
    });

    res.json({ milestoneId, quotes: grouped });
  });
};

// POST /api/procurement/quotes/:quoteId/approve
const approveQuote = (req, res) => {
  const { quoteId } = req.params;

  // Step 1: Find milestone for this quote
  const findMilestoneQuery = "SELECT milestone_id FROM procurement_quotes WHERE id = ?";
  db.query(findMilestoneQuery, [quoteId], (err, rows) => {
    if (err) {
      console.error("Error finding milestone:", err);
      return res.status(500).json({ message: "Database error." });
    }
    if (rows.length === 0) return res.status(404).json({ message: "Quote not found." });

    const milestoneId = rows[0].milestone_id;

    // Step 2: Reject all other quotes for this milestone
    const rejectQuery = "UPDATE procurement_quotes SET status = 'Rejected' WHERE milestone_id = ?";
    db.query(rejectQuery, [milestoneId], (rejErr) => {
      if (rejErr) {
        console.error("Error rejecting other quotes:", rejErr);
        return res.status(500).json({ message: "Failed to reject other quotes." });
      }

      // Step 3: Approve the selected one
      const approveQuery = "UPDATE procurement_quotes SET status = 'Selected' WHERE id = ?";
      db.query(approveQuery, [quoteId], (appErr) => {
        if (appErr) {
          console.error("Error approving quote:", appErr);
          return res.status(500).json({ message: "Failed to approve quote." });
        }

        res.json({ message: "Supplier quote approved successfully." });
      });
    });
  });
};

const getPurchaseOrders = (req, res) => {
  const { project_id, milestone_id, supplier_id } = req.query;

  let query = `
    SELECT 
      po.id AS po_id,
      po.po_number,
      po.project_id,
      po.milestone_id,
      po.quote_id,
      po.supplier_id,
      s.supplier_name,
      po.total_amount,
      po.created_by,
      u.full_name AS created_by_name,
      po.created_at,
      po.status,
      poi.id AS item_id,
      poi.material_name,
      poi.unit,
      poi.quantity,
      poi.unit_price,
      poi.total_cost
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    LEFT JOIN users u ON po.created_by = u.id
    LEFT JOIN purchase_order_items poi ON po.id = poi.po_id
    WHERE 1=1
  `;

  const params = [];

  if (project_id) {
    query += ` AND po.project_id = ?`;
    params.push(project_id);
  }

  if (milestone_id) {
    query += ` AND po.milestone_id = ?`;
    params.push(milestone_id);
  }

  if (supplier_id) {
    query += ` AND po.supplier_id = ?`;
    params.push(supplier_id);
  }

  query += ` ORDER BY po.created_at DESC, poi.id ASC`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching purchase orders:", err);
      return res.status(500).json({ error: "Failed to fetch purchase orders" });
    }

    // Group items under each PO
    const grouped = {};
    results.forEach((row) => {
      if (!grouped[row.po_id]) {
        grouped[row.po_id] = {
          po_id: row.po_id,
          po_number: row.po_number,
          project_id: row.project_id,
          milestone_id: row.milestone_id,
          quote_id: row.quote_id,
          supplier_id: row.supplier_id,
          supplier_name: row.supplier_name,
          total_amount: row.total_amount,
          created_by: row.created_by,
          created_by_name: row.created_by_name,
          created_at: row.created_at,
          status: row.status,
          items: [],
        };
      }

      if (row.item_id) {
        grouped[row.po_id].items.push({
          item_id: row.item_id,
          material_name: row.material_name,
          unit: row.unit,
          quantity: row.quantity,
          unit_price: row.unit_price,
          total_cost: row.total_cost,
        });
      }
    });

    const response = Object.values(grouped);
    res.json(response);
  });
};

const sendPurchaseOrderToSupplier = (req, res) => {
  const { po_id } = req.params;
  const { sent_by } = req.body;

  // 1️⃣ Fetch PO details + Supplier info
  const poQuery = `
    SELECT 
      po.id AS po_id,
      po.po_number,
      po.total_amount,
      po.project_id,
      po.milestone_id,
      po.status,
      s.supplier_name,
      s.email AS supplier_email
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    WHERE po.id = ?
  `;

  db.query(poQuery, [po_id], (err, poResults) => {
    if (err) {
      console.error("Error fetching purchase order:", err);
      return res.status(500).json({ message: "Error fetching purchase order" });
    }

    if (poResults.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const po = poResults[0];

    if (!po.supplier_email) {
      return res.status(400).json({ message: "Supplier email not found" });
    }

    // 2️⃣ Fetch PO items
    const itemsQuery = `
    SELECT 
      material_name,
      unit,
      quantity,
      unit_price,
      (quantity * unit_price) AS total_price
    FROM purchase_order_items
    WHERE po_id = ?
    `;

    db.query(itemsQuery, [po_id], (itemErr, itemResults) => {
      if (itemErr) {
        console.error("Error fetching PO items:", itemErr);
        return res.status(500).json({ message: "Error fetching PO items" });
      }

      // Generate HTML table rows
      const itemsHTML = itemResults
        .map(
          (item, index) => `
          <tr>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${index + 1}</td>
            <td style="padding:8px; border:1px solid #ddd;">${item.material_name}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.unit}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.quantity}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:right;">₱${Number(item.unit_price).toLocaleString()}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:right;">₱${Number(item.total_price).toLocaleString()}</td>
          </tr>`
        )
        .join("");

      // ✉️ HTML Email Template
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; background: #f9f9f9; padding: 20px;">
          <div style="max-width: 800px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: #004aad; color: white; padding: 16px 24px;">
              <h2 style="margin: 0;">Purchase Order Notification</h2>
            </div>

            <div style="padding: 24px;">
              <p>Dear <strong>${po.supplier_name}</strong>,</p>

              <p>We are pleased to issue the following purchase order for your review and processing:</p>

              <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
                <tr><td style="padding:8px; border:1px solid #ddd;"><strong>PO Number:</strong></td><td style="padding:8px; border:1px solid #ddd;">${po.po_number}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Total Amount:</strong></td><td style="padding:8px; border:1px solid #ddd;">₱${Number(po.total_amount).toLocaleString()}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Project ID:</strong></td><td style="padding:8px; border:1px solid #ddd;">${po.project_id}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Milestone ID:</strong></td><td style="padding:8px; border:1px solid #ddd;">${po.milestone_id}</td></tr>
              </table>

              <h3 style="margin-top: 24px;">Items Ordered:</h3>
              <table style="width:100%; border-collapse: collapse; margin-top: 8px;">
                <thead>
                  <tr style="background:#f1f1f1;">
                    <th style="padding:8px; border:1px solid #ddd;">#</th>
                    <th style="padding:8px; border:1px solid #ddd;">Item</th>
                    <th style="padding:8px; border:1px solid #ddd;">Unit</th>
                    <th style="padding:8px; border:1px solid #ddd;">Quantity</th>
                    <th style="padding:8px; border:1px solid #ddd;">Unit Price</th>
                    <th style="padding:8px; border:1px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <p style="margin-top: 24px;">
                Kindly confirm receipt of this order and provide your expected delivery schedule at your earliest convenience.
              </p>

              <p style="margin-top: 24px;">Thank you for your continued partnership.</p>

              <p style="margin-top: 16px;">
                Regards,<br/>
                <strong>Procurement Department</strong><br/>
                <span style="color: #004aad;">DUV ENGINEERS</span>
              </p>
            </div>

            <div style="background: #f1f1f1; text-align: center; padding: 12px; font-size: 12px; color: #666;">
              This is an automated email. Please do not reply directly to this message.
            </div>
          </div>
        </div>
      `;

      // 3️⃣ Send email
      const mailOptions = {
        from: `"Procurement Department" <${process.env.SMTP_EMAIL}>`,
        to: po.supplier_email,
        subject: `Purchase Order ${po.po_number} - Please Confirm`,
        html: htmlContent,
      };

      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error("Error sending email:", mailErr);
          return res.status(500).json({ message: "Failed to send email to supplier" });
        }

        console.log("Email sent:", info.response);

        // 4️⃣ Update PO status
        const updateQuery = `
          UPDATE purchase_orders
          SET status = 'Sent to Supplier',
              sent_by = ?,
              sent_at = NOW()
          WHERE id = ?
        `;

        db.query(updateQuery, [sent_by, po_id], (updateErr) => {
          if (updateErr) {
            console.error("Error updating PO status:", updateErr);
            return res.status(500).json({ message: "Email sent but failed to update PO status" });
          }

          res.json({
            message: `Purchase order ${po.po_number} sent to ${po.supplier_name} successfully.`,
            po_id,
            item_count: itemResults.length,
            email_info: info.response,
          });
        });
      });
    });
  });
};


module.exports = { addSupplier, getSuppliers, updateSupplier, 
                   deleteSupplier, sendQuotationRequests, getQuoteByToken,
                   submitSupplierQuote, getSubmittedQuotes, getMilestonesWithQuotes,
                   getQuotesByMilestone, approveQuote, getPurchaseOrders,
                   sendPurchaseOrderToSupplier};