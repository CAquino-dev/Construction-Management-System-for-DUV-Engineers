const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/proposals');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup Multer storage for proposals
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext;
    cb(null, fileName);
  }
});

const uploadProposalPDF = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
}).single('proposal_file'); // Name should match frontend

const createProposal = (req, res) => {
  uploadProposalPDF(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err.message);
      return res.status(400).json({ error: err.message });
    }

    const {
      lead_id,
      title,
      description,
      scope_of_work,
      budget_estimate,
      timeline_estimate,
      payment_terms
    } = req.body;

    if (!lead_id || !title || !description || !scope_of_work || !budget_estimate || !timeline_estimate) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    let parsedScopeOfWork;
    try {
      parsedScopeOfWork = JSON.parse(scope_of_work);
    } catch (parseErr) {
      return res.status(400).json({ error: 'Invalid format for scope_of_work. Must be a JSON array.' });
    }

    const fileUrl = req.file ? `/uploads/proposals/${req.file.filename}` : null;
    const approvalToken = uuidv4();

    const query = `
      INSERT INTO proposals (
        lead_id,
        title,
        description,
        scope_of_work,
        budget_estimate,
        timeline_estimate,
        payment_terms,
        file_url,
        approval_token,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
    `;

    const values = [
      lead_id,
      title,
      description,
      JSON.stringify(parsedScopeOfWork),
      budget_estimate,
      timeline_estimate,
      payment_terms || null,
      fileUrl,
      approvalToken
    ];

    db.query(query, values, (dbErr, result) => {
      if (dbErr) {
        console.error('Database error:', dbErr);
        return res.status(500).json({ error: 'Failed to create proposal.' });
      }

      const approvalLink = `${process.env.FRONTEND_URL}/proposal/respond/${approvalToken}`;

      return res.status(201).json({
        message: 'Proposal created successfully.',
        proposalId: result.insertId,
        approvalLink
      });
    });
  });
};

const getProposalByToken = (req, res) => {
  const { token } = req.params;

  const query = `
    SELECT p.*, l.client_name, l.project_interest 
    FROM proposals p 
    JOIN leads l ON p.lead_id = l.id 
    WHERE p.approval_token = ?
  `;

  db.query(query, [token], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired approval link.' });
    }

    const proposal = results[0];

    try {
      proposal.scope_of_work = JSON.parse(proposal.scope_of_work);
    } catch (err) {
      proposal.scope_of_work = [];
    }

    return res.json(proposal);
  });
};

const respondToProposal = (req, res) => {
  const { token, status } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!token || !["approve", "reject"].includes(status)) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const selectSql = "SELECT * FROM proposals WHERE approval_token = ? LIMIT 1";
  db.query(selectSql, [token], (err, results) => {
    if (err) {
      console.error("Error querying proposals:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Proposal not found or already handled" });
    }

    const proposal = results[0];

    if (proposal.status !== "pending") {
      return res.status(400).json({ message: `Proposal already ${proposal.status}` });
    }

    const finalStatus = status === "approve" ? "approved" : "rejected";
    const updateSql = `
      UPDATE proposals
      SET status = ?, responded_at = NOW(), approved_by_ip = ?
      WHERE id = ?
    `;

    db.query(updateSql, [finalStatus, clientIp, proposal.id], (updateErr) => {
      if (updateErr) {
        console.error("Error updating proposal:", updateErr);
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ message: `Proposal successfully ${finalStatus}.` });
    });
  });
};

const getProposalResponse = (req, res) => {
  const query = `
    SELECT 
      proposals.id,
      leads.client_name,
      proposals.title,
      proposals.status,
      proposals.created_at,
      proposals.responded_at,
      proposals.approved_by_ip
    FROM proposals
    JOIN leads ON proposals.lead_id = leads.id
    ORDER BY proposals.responded_at DESC, proposals.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching proposal responses:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(results);
  });
};

const generateContract = (req, res) => {
  const { proposalId } = req.params;

  // Step 1: Get proposal and lead info
  const query = `
    SELECT p.*, l.client_name, l.contact_info, l.project_interest, l.budget, l.timeline, l.id AS lead_id
    FROM proposals p
    JOIN leads l ON p.lead_id = l.id
    WHERE p.id = ?
  `;

  db.query(query, [proposalId], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!result.length) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    const data = result[0];

    // Step 2: Render EJS template
    ejs.renderFile(
      path.join(__dirname, "../templates/contract_template.ejs"),
      { data },
      async (err, htmlTemplate) => {
        if (err) {
          console.error("EJS render error:", err);
          return res.status(500).json({ error: "Template rendering failed" });
        }

        try {
          // Step 3: Generate PDF using Puppeteer
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });
          const pdfBuffer = await page.pdf({ format: "A4" });
          await browser.close();

          // Step 4: Save PDF to disk
          const fileName = `contract_${proposalId}_${Date.now()}.pdf`;
          const filePath = path.join(__dirname, "../public/contracts", fileName);
          fs.writeFileSync(filePath, pdfBuffer);

          const fileUrl = `/contracts/${fileName}`;

          // Step 5: Insert contract record into DB
          const insertQuery = `
            INSERT INTO contracts (lead_id, proposal_id, contract_file_url)
            VALUES (?, ?, ?)
          `;

          db.query(insertQuery, [data.lead_id, data.id, fileUrl], (insertErr, resultInsert) => {
            if (insertErr) {
              console.error("Insert error:", insertErr);
              return res.status(500).json({ error: "Failed to save contract record" });
            }

            // Step 6: Generate approval link
            const contractId = resultInsert.insertId;
            const approvalLink = `${process.env.FRONTEND_URL}/contract/respond/${contractId}`;

            // ✅ Success
            res.status(201).json({
              message: "Contract generated",
              fileUrl,
              approvalLink
            });
          });
        } catch (pdfErr) {
          console.error("PDF generation error:", pdfErr);
          res.status(500).json({ error: "Failed to generate contract PDF" });
        }
      }
    );
  });
};

const getContract = (req, res) => {
  const { proposalId } = req.params;

  const query = `
    SELECT contract_file_url 
    FROM contracts
    JOIN proposals on contracts.id = proposals.id
    WHERE contracts.id = ?
  `;

  db.query(query, [proposalId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired contract link.' });
    }

    const proposal = results[0];

    return res.json(proposal);
  });
};


module.exports = {
  createProposal,
  getProposalByToken,
  respondToProposal,
  getProposalResponse,
  generateContract,
  getContract
};
