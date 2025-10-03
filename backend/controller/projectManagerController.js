const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const nodemailer = require("nodemailer");
const qrcode = require("qrcode");



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
      console.error("File upload error:", err.message);
      return res.status(400).json({ error: err.message });
    }

    const {
      lead_id,
      title,
      description,
      scope_of_work,
      budget_estimate,
      start_date,   // ✅ new
      end_date,     // ✅ new
      payment_term_id,
    } = req.body;

    if (
      !lead_id ||
      !title ||
      !description ||
      !scope_of_work ||
      !budget_estimate ||
      !start_date ||
      !end_date ||
      !payment_term_id
    ) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    let parsedScopeOfWork;
    try {
      parsedScopeOfWork = JSON.parse(scope_of_work);
    } catch (parseErr) {
      return res.status(400).json({ error: "Invalid format for scope_of_work. Must be a JSON array." });
    }

    const fileUrl = req.file ? `/uploads/proposals/${req.file.filename}` : null;
    const approvalToken = uuidv4();

    // 1. Fetch payment term text for snapshot
    const termQuery = `SELECT name FROM payment_terms WHERE id = ? LIMIT 1`;

    db.query(termQuery, [payment_term_id], (termErr, termResult) => {
      if (termErr) {
        console.error("DB error fetching payment term:", termErr);
        return res.status(500).json({ error: "Failed to fetch payment term." });
      }

      if (!termResult.length) {
        return res.status(400).json({ error: "Invalid payment term selected." });
      }

      const payment_terms = termResult[0].name; // snapshot text

      // 2. Insert proposal
      const query = `
        INSERT INTO proposals (
          lead_id,
          title,
          description,
          scope_of_work,
          budget_estimate,
          start_date,
          end_date,
          payment_term_id,
          payment_terms,
          file_url,
          approval_token,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
      `;

      const values = [
        lead_id,
        title,
        description,
        JSON.stringify(parsedScopeOfWork),
        budget_estimate,
        start_date,
        end_date,
        payment_term_id,
        payment_terms,
        fileUrl,
        approvalToken,
      ];

      db.query(query, values, (dbErr, result) => {
        if (dbErr) {
          console.error("Database error:", dbErr);
          return res.status(500).json({ error: "Failed to create proposal." });
        }

        const approvalLink = `${process.env.FRONTEND_URL}/proposal/respond/${approvalToken}`;

        return res.status(201).json({
          message: "Proposal created successfully.",
          proposalId: result.insertId,
          approvalLink,
        });
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
  const { token, response, notes } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!token || !["approved", "rejected"].includes(response)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const selectSql = "SELECT * FROM proposals WHERE approval_token = ? LIMIT 1";
  db.query(selectSql, [token], (err, results) => {
    if (err) {
      console.error("Error querying proposals:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Proposal not found or already handled" });
    }

    const proposal = results[0];

    if (proposal.status !== "pending") {
      return res.status(400).json({ error: `Proposal already ${proposal.status}` });
    }

    const updateSql = `
      UPDATE proposals
      SET status = ?, responded_at = NOW(), approved_by_ip = ?, rejection_notes = ?
      WHERE id = ?
    `;

    const rejectionNotes = response === "rejected" ? notes || null : null;

    db.query(updateSql, [response, clientIp, rejectionNotes, proposal.id], (updateErr) => {
      if (updateErr) {
        console.error("Error updating proposal:", updateErr);
        return res.status(500).json({ error: "Server error" });
      }

      res.json({ message: `Proposal successfully ${response}.` });
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

  // Step 1: Get proposal + lead + payment term info
  const query = `
    SELECT p.*, l.client_name, l.email, l.phone_number, l.project_interest, 
           p.budget_estimate, l.timeline, l.id AS lead_id,
           pt.id AS payment_term_id, pt.name AS payment_term_label
    FROM proposals p
    JOIN leads l ON p.lead_id = l.id
    LEFT JOIN payment_terms pt ON p.payment_term_id = pt.id
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

    // Step 2: Prepare contract data
    const formData = {
      title: data.title,
      description: data.description,
      scope_of_work: JSON.parse(data.scope_of_work || "[]"),
      budget_estimate: data.budget_estimate,
      start_date: data.start_date,   // ✅ use start_date
      end_date: data.end_date,       // ✅ use end_date
      payment_terms:
        data.payment_term_label ||
        "50% down payment, 30% upon completion, 20% upon final acceptance",
    };

    const selectedLead = {
      client_name: data.client_name,
      email: data.email,
      phone_number: data.phone_number,
      project_interest: data.project_interest,
      budget: data.budget_estimate,
      start_date: data.start_date,   // ✅ use start_date
      end_date: data.end_date,       // ✅ use end_date
      lead_id: data.lead_id,
    };

    // Step 3: Render contract PDF
    ejs.renderFile(
      path.join(__dirname, "../templates/contract_template.ejs"),
      { selectedLead, formData },
      async (err, htmlTemplate) => {
        if (err) {
          console.error("EJS render error:", err);
          return res.status(500).json({ error: "Template rendering failed" });
        }

        try {
          const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
          });
          const page = await browser.newPage();
          await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });
          const pdfBuffer = await page.pdf({ format: "A4" });
          await browser.close();

          // Step 4: Save PDF to disk
          const fileName = `contract_${proposalId}_${Date.now()}.pdf`;
          const filePath = path.join(__dirname, "../public/contracts", fileName);
          fs.writeFileSync(filePath, pdfBuffer);
          const fileUrl = `/contracts/${fileName}`;

          // Step 5: Insert contract into DB (now includes start/end dates)
          const insertQuery = `
            INSERT INTO contracts 
            (lead_id, proposal_id, contract_file_url, total_amount, payment_term_id, payment_terms, start_date, end_date, paid_amount, payment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'Unpaid')
          `;

          db.query(
            insertQuery,
            [
              data.lead_id,
              data.id,
              fileUrl,
              data.budget_estimate, // total_amount = proposal budget
              data.payment_term_id || null,
              formData.payment_terms,
              data.start_date,
              data.end_date,
            ],
            (insertErr, resultInsert) => {
              if (insertErr) {
                console.error("Insert error:", insertErr);
                return res.status(500).json({ error: "Failed to save contract record" });
              }

              const contractId = resultInsert.insertId;
              const approvalLink = `${process.env.FRONTEND_URL}/contract/respond/${contractId}`;

              // Step 6: Save access link
              db.query(
                `UPDATE contracts SET access_link = ? WHERE id = ?`,
                [approvalLink, contractId],
                (updateErr) => {
                  if (updateErr) {
                    console.error("Failed to update access_link:", updateErr);
                    return res.status(500).json({ error: "Failed to update access link" });
                  }

                  // ✅ DONE
                  return res.status(201).json({
                    message: "Contract generated successfully",
                    fileUrl,
                    approvalLink,
                    contractId,
                  });
                }
              );
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
    SELECT contract_file_url, status, id 
    FROM contracts
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

  const signatureFileName = `signature_${proposalId}.png`;
  const signatureFilePath = path.join(signatureDir, signatureFileName);

  const base64Data = base64Signature.replace(/^data:image\/png;base64,/, '');
  fs.writeFile(signatureFilePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving signature:', err);
      return res.status(500).json({ error: 'Failed to save signature' });
    }

    // Find the contract via proposal_id
    const query = `SELECT id, contract_file_url, total_amount 
                   FROM contracts 
                   WHERE id = ? 
                   LIMIT 1`;

    db.query(query, [proposalId], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Contract not found for proposal' });
      }

      const contractId = results[0].id;
      const totalAmount = results[0].total_amount;
      const contractPath = path.join(contractDir, results[0].contract_file_url);
      const signedFileName = `signed_contract_${proposalId}.pdf`;
      const signedPath = path.join(signedDir, signedFileName);

      try {
        // Load PDF
        const existingPdfBytes = fs.readFileSync(contractPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Embed signature
        const signatureImageBytes = fs.readFileSync(signatureFilePath);
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

        const pages = pdfDoc.getPages();
        const firstPage = pages[1];
        const { width } = firstPage.getSize();
        const imageDims = signatureImage.scale(0.25);

        firstPage.drawImage(signatureImage, {
          x: width - imageDims.width - 50,
          y: 50,
          width: imageDims.width,
          height: imageDims.height,
        });

        const signedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(signedPath, signedPdfBytes);

        // Update DB
        const updateQuery = `
          UPDATE contracts
          SET status = 'signed',
              contract_signed_at = NOW(),
              signed_by_ip = ?,
              contract_file_url = ?
          WHERE id = ?
        `;
        const userIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

        db.query(updateQuery, [userIp, `/signed_contracts/${signedFileName}`, contractId], (err2) => {
          if (err2) {
            console.error('Error updating contract status:', err2);
            return res.status(500).json({ error: 'Failed to update contract record' });
          }

          // Calculate downpayment (e.g., 30%)
          const downpaymentAmount = totalAmount * 0.3;

          return res.status(200).json({
            message: 'Contract signed successfully',
            contractId,
            downpaymentAmount,
          });
        });
      } catch (pdfErr) {
        console.error('PDF processing error:', pdfErr);
        return res.status(500).json({ error: 'Failed to sign contract' });
      }
    });
  });
};


const getApprovedContracts = (req, res) => {
  const query = `
    SELECT 
      contracts.id AS contract_id,
      contracts.status AS contract_status,
      contracts.contract_file_url,
      contracts.contract_signed_at,
      contracts.created_at AS contract_created_at,
      contracts.access_link,
      contracts.approval_status,
      contracts.start_date AS contract_start_date,
      contracts.end_date AS contract_end_date,

      proposals.title AS proposal_title,
      proposals.budget_estimate,
      proposals.start_date AS proposal_start_date,
      proposals.end_date AS proposal_end_date,
      proposals.scope_of_work,
      proposals.status AS proposal_status,

      leads.client_name,
      leads.email AS client_email,
      leads.phone_number AS client_phone,
      leads.project_interest
    FROM contracts
    JOIN proposals ON contracts.proposal_id = proposals.id
    JOIN leads ON proposals.lead_id = leads.id
    WHERE contracts.approval_status = 'approved'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching approved contracts:", err);
      return res.status(500).json({ error: "Failed to fetch approved contracts" });
    }

    const contracts = results.map(contract => ({
      ...contract,
      contract_file_url: contract.contract_file_url?.startsWith("http")
        ? contract.contract_file_url
        : `${req.protocol}://${req.get("host")}${contract.contract_file_url}`
    }));

    res.json(contracts);
  });
};


const sendContractToClient = (req, res) => {
  const contractId = req.params.id;

  const query = `
    SELECT c.*, l.email, l.client_name
    FROM contracts c
    JOIN leads l ON c.lead_id = l.id
    WHERE c.id = ?;
  `;

  db.query(query, [contractId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const contract = results[0];
    const approvalLink = `${process.env.FRONTEND_URL}/contract/respond/${contract.id}`;

    if (!contract.email) {
      return res.status(400).json({ error: "Client email is missing" });
    }

    qrcode.toDataURL(approvalLink, (qrErr, qrCodeDataURL) => {
      if (qrErr) {
        console.error("QR code error:", qrErr);
        return res.status(500).json({ error: "Failed to generate QR code" });
      }

      // Remove the header "data:image/png;base64," so we can attach it
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, "");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "caquino.dev@gmail.com",
          pass: "ykvj ebtt uois mkns",
        },
      });

      const mailOptions = {
        from: '"DUV Engineers" <caquino.dev@gmail.com>',
        to: contract.email,
        subject: "Your Contract is Ready for Review",
        html: `
          <p>Hi ${contract.client_name},</p>
          <p>Your contract is now ready for your review. Please click the link below or scan the QR code to view and approve it:</p>
          <p><a href="${approvalLink}">${approvalLink}</a></p>
          <img src="cid:qrcode" alt="QR Code" />
        `,
        attachments: [
          {
            filename: "qrcode.png",
            content: base64Data,
            encoding: "base64",
            cid: "qrcode", // same as in the img src
          },
        ],
      };

      transporter.sendMail(mailOptions, (emailErr, info) => {
        if (emailErr) {
          console.error("Email sending error:", emailErr);
          return res.status(500).json({ error: "Failed to send email" });
        }

        res.status(200).json({ message: "Contract sent to client successfully" });
      });
    });
  });
};

const clientRejectContract = (req, res) => {
  const contractId = req.params.id;
  const { client_rejection_notes } = req.body;

    if (!client_rejection_notes) {
    return res.status(400).json({ error: "Rejection notes are required" });
  }

  const query = `UPDATE contracts 
  SET status = 'rejected', client_rejection_notes = ? 
  WHERE id = ?`;

  db.query(query, [client_rejection_notes, contractId], (err) => {
    if (err) return res.status(500).json({ error: "Rejection failed" });
    res.json({ success: true });
  });

}

const getPaymentTerms = (req, res) => {

  const query = `SELECT * FROM payment_terms`;

  db.query(query, (err, results) => {
    if(err){
      console.error("error getting payment temrs", err)
      return res.status(500).json({ error: "Failed to get payment terms" });
    }
    res.json(results);
  })
};

module.exports = {
  createProposal,
  getProposalByToken,
  respondToProposal,
  getProposalResponse,
  generateContract,
  getContract,
  uploadClientSignature,
  getApprovedContracts,
  sendContractToClient,
  clientRejectContract,
  getPaymentTerms
};