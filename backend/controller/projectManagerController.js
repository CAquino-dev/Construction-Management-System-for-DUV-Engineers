const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');


// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/proposals');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const signatureDir = path.join(__dirname, '../uploads/signatures');
if (!fs.existsSync(signatureDir)) {
  fs.mkdirSync(signatureDir, { recursive: true });
}

const contractDir = path.join(__dirname, '../public/');
const signedDir = path.join(__dirname, '../public/signed_contracts');

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

    // Step 2: Render the EJS template
    ejs.renderFile(
      path.join(__dirname, "../templates/contract_template.ejs"),
      { data, includeSignaturePlaceholder: true }, // 👈 you can control conditional rendering of signature box
      async (err, htmlTemplate) => {
        if (err) {
          console.error("EJS render error:", err);
          return res.status(500).json({ error: "Template rendering failed" });
        }

        try {
          // Step 3: Generate PDF from HTML using Puppeteer
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

          // Step 5: Save contract info to database
          const insertQuery = `
            INSERT INTO contracts (lead_id, proposal_id, contract_file_url)
            VALUES (?, ?, ?)
          `;

          db.query(insertQuery, [data.lead_id, data.id, fileUrl], (insertErr, resultInsert) => {
              if (insertErr) {
                console.error("Insert error:", insertErr);
                return res.status(500).json({ error: "Failed to save contract record" });
              }

              const contractId = resultInsert.insertId;
              const approvalLink = `${process.env.FRONTEND_URL}/contract/respond/${contractId}`;

              res.status(201).json({
                message: "Contract generated successfully",
                fileUrl,
                approvalLink
              });
            }
          );
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

const uploadClientSignature = (req, res) => {
  const { base64Signature, proposalId } = req.body;

  if (!base64Signature || !proposalId) {
    return res.status(400).json({ error: 'Missing signature or proposal ID' });
  }

  // Prepare the signature path
  const signatureFileName = `signature_${proposalId}.png`;
  const signatureFilePath = path.join(signatureDir, signatureFileName);

  // Save the signature image
  const base64Data = base64Signature.replace(/^data:image\/png;base64,/, '');
  fs.writeFile(signatureFilePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving signature:', err);
      return res.status(500).json({ error: 'Failed to save signature' });
    }

    // Step 2: Lookup contract file path from DB
    const query = 'SELECT contract_file_url FROM contracts WHERE id = ? LIMIT 1';
    db.query(query, [proposalId], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0 || !results[0].contract_file_url) {
        return res.status(404).json({ error: 'Contract not found for proposal' });
      }

      const contractPath = path.join(contractDir, results[0].contract_file_url);
      const signedFileName = `signed_contract_${proposalId}.pdf`;
      const signedPath = path.join(signedDir, signedFileName);

      try {
        // Load PDF
        const existingPdfBytes = fs.readFileSync(contractPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Embed signature image
        const signatureImageBytes = fs.readFileSync(signatureFilePath);
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Position: bottom-right corner (adjust as needed)
        const { width, height } = firstPage.getSize();
        const imageDims = signatureImage.scale(0.25);
        firstPage.drawImage(signatureImage, {
          x: width - imageDims.width - 50,
          y: 50,
          width: imageDims.width,
          height: imageDims.height,
        });

        const signedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(signedPath, signedPdfBytes);

        // Step 3: Update DB
        const updateQuery = `
          UPDATE contracts
          SET status = 'signed',
              contract_signed_at = NOW(),
              signed_by_ip = ?,
              contract_file_url = ?
          WHERE id = ?
        `;
        const userIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

        db.query(updateQuery, [userIp, `signed_contracts/${signedFileName}`, proposalId], (err2) => {
          
          if (err2) {
            console.error('Error updating contract status:', err2);
            return res.status(500).json({ error: 'Failed to update contract record' });
          }

          return res.status(200).json({ message: 'Contract signed successfully' });
        });
      } catch (pdfErr) {
        console.error('PDF processing error:', pdfErr);
        return res.status(500).json({ error: 'Failed to sign contract' });
      }
    });
  });
};


module.exports = {
  createProposal,
  getProposalByToken,
  respondToProposal,
  getProposalResponse,
  generateContract,
  getContract,
  uploadClientSignature
};
