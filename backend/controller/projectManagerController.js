const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

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

// Proposal creation handler
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

    // ✅ Parse the scope_of_work string from FormData (from JSON string to array)
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

    // ✅ Parse scope_of_work from JSON string to array
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

  // Step 1: Check if the proposal exists
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

    // Step 2: Update the proposal
    const finalStatus = status === "approve" ? "approved" : "rejected";
    const updateSql = `
      UPDATE proposals
      SET status = ?, responded_at = NOW(), approved_by_ip = ?
      WHERE id = ?
    `;

    db.query(updateSql, [finalStatus, clientIp, proposal.id], (updateErr, updateResult) => {
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
  })
}


module.exports = {
  createProposal, getProposalByToken, respondToProposal, getProposalResponse
};
