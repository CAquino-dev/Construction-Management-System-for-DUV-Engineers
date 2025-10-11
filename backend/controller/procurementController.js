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


module.exports = { addSupplier, getSuppliers, updateSupplier, 
                   deleteSupplier, sendQuotationRequests, getQuoteByToken,
                   submitSupplierQuote, getSubmittedQuotes, getMilestonesWithQuotes,
                   getQuotesByMilestone, approveQuote};