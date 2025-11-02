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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

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
      start_date,
      end_date,
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

    // 1. Fetch payment term text + client email
    const termQuery = `
      SELECT pt.name AS payment_term_name, l.email AS client_email, l.client_name
      FROM payment_terms pt
      JOIN leads l ON l.id = ?
      WHERE pt.id = ? LIMIT 1
    `;

    db.query(termQuery, [lead_id, payment_term_id], (termErr, termResult) => {
      if (termErr) {
        console.error("DB error fetching payment term or lead:", termErr);
        return res.status(500).json({ error: "Failed to fetch payment term or lead." });
      }

      if (!termResult.length) {
        return res.status(400).json({ error: "Invalid payment term or lead." });
      }

      const { payment_term_name, client_email, client_name } = termResult[0];

      // 2. Insert proposal
      const insertQuery = `
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
        payment_term_name,
        fileUrl,
        approvalToken,
      ];

      db.query(insertQuery, values, (dbErr, result) => {
        if (dbErr) {
          console.error("Database error:", dbErr);
          return res.status(500).json({ error: "Failed to create proposal." });
        }

        const approvalLink = `${process.env.FRONTEND_URL}/proposal/respond/${approvalToken}`;

        // 3. Send email with approval link
        if (client_email) {
          const mailOptions = {
            from: `"DUV ENGINEERS" <${process.env.SMTP_EMAIL}>`,
            to: client_email,
            subject: `Proposal for Approval - ${title}`,
            html: `
              <p>Dear ${client_name || "Client"},</p>
              <p>We’re pleased to share a new project proposal titled <strong>${title}</strong>.</p>
              <p>Please review and respond to the proposal using the link below:</p>
              <p><a href="${approvalLink}" target="_blank">${approvalLink}</a></p>
              <p>Thank you for your time and consideration.</p>
              <br>
              <p>Best regards,<br><strong>DUV ENGINEERS</strong></p>
            `,
          };

          transporter.sendMail(mailOptions, (emailErr, info) => {
            if (emailErr) {
              console.error("Error sending email:", emailErr);
              // We won’t fail the main response if email fails
            } else {
              console.log("Email sent:", info.response);
            }
          });
        }

        // 4. Respond to frontend
        return res.status(201).json({
          message: "Proposal created successfully and email sent to client.",
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
      proposals.approved_by_ip,
      proposals.rejection_notes,
      proposals.start_date,
      proposals.end_date,
      proposals.description,
      proposals.scope_of_work,
      proposals.payment_terms,
      proposals.lead_id,
      proposals.file_url,
      proposals.budget_estimate,
      leads.email
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
      c.*,
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
    FROM contracts c
    JOIN proposals ON c.proposal_id = proposals.id
    JOIN leads ON proposals.lead_id = leads.id
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
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASS,
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

// ✅ Setup multer for site visit uploads
const siteVisitStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/site_reports"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "sitevisit-" + uniqueSuffix + ext);
  },
});

const siteVisitUpload = multer({
  storage: siteVisitStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, JPG, and PNG files are allowed"));
  },
}).single("report_file"); // must match frontend field name

// ✅ Controller: create site visit (callback style)
const createSiteVisit = (req, res) => {
  siteVisitUpload(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    const {
      lead_id,
      location,
      dateVisited,
      terrainType,
      accessibility,
      waterSource,
      powerSource,
      areaMeasurement,
      notes,
      userId,
    } = req.body;

    if (!lead_id || !location || !dateVisited) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Get file path if uploaded
    const report_file_url = req.file
      ? `/uploads/site_reports/${req.file.filename}`
      : null;

    const insertQuery = `
      INSERT INTO site_visits 
      (created_by, lead_id, location, date_visited, terrain_type, accessibility, water_source, power_source, area_measurement, notes, report_file_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      userId,
      lead_id,
      location,
      dateVisited,
      terrainType || null,
      accessibility || null,
      waterSource || null,
      powerSource || null,
      areaMeasurement || null,
      notes || null,
      report_file_url,
    ];

    db.query(insertQuery, values, (error, results) => {
      if (error) {
        console.error("Error inserting site visit:", error);
        return res.status(500).json({ error: "Failed to save site visit" });
      }

      // ✅ Update lead status after insert
      const updateLeadStatusQuery = `
        UPDATE leads 
        SET status = 'site_visited'
        WHERE id = ?
      `;

      db.query(updateLeadStatusQuery, [lead_id], (statusErr) => {
        if (statusErr) {
          console.error("Error updating lead status:", statusErr);
          return res.status(500).json({
            error:
              "Site visit saved, but failed to update lead status",
          });
        }

        res.status(201).json({
          success: true,
          message:
            "✅ Site visit saved and lead status updated to 'site_visited'",
          siteVisitId: results.insertId,
          report_file_url,
        });
      });
    });
  });
};



const getScheduledSiteVisits = (req, res) => {
    const query = `SELECT * FROM leads WHERE status = 'site_scheduled'`;

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching leads:', error);
            return res.status(500).json({ error: 'Failed to fetch leads' });
        }

        res.status(200).json(results);
    });

};

const getForProcurement = (req, res) => {
  const query = 
    ` SELECT
        m.id AS milestone_id,
        m.project_id,
        m.timestamp,
        m.title,
        m.details,
        m.status,
        m.start_date,
        m.due_date,

        mb.id AS milestone_boq_id,
        b.id AS boq_id,
        b.item_no,
        b.description AS boq_description,
        b.unit AS boq_unit,
        b.quantity AS boq_quantity,
        b.unit_cost AS boq_unit_cost,
        b.total_cost AS boq_total_cost,

        mm.id AS mto_id,
        mm.description AS mto_description,
        mm.unit AS mto_unit,
        mm.quantity AS mto_quantity,
        mm.unit_cost AS mto_unit_cost,
        mm.total_cost AS mto_total_cost
      FROM milestones m
      LEFT JOIN milestone_boq mb ON m.id = mb.milestone_id
      LEFT JOIN boq b ON mb.boq_id = b.id
      LEFT JOIN milestone_mto mm ON mb.id = mm.milestone_boq_id
      WHERE m.status IN ('For Procurement', 'Finance Rejected')
      ORDER BY m.due_date ASC;
      `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching milestones:", err);
      return res.status(500).json({ error: "Failed to fetch milestones" });
    }

    const milestonesMap = new Map();

    results.forEach(row => {
      if (!milestonesMap.has(row.milestone_id)) {
        milestonesMap.set(row.milestone_id, {
          id: row.milestone_id,
          project_id: row.project_id,
          timestamp: row.timestamp,
          title: row.title,
          details: row.details,
          status: row.status,
          start_date: row.start_date,
          due_date: row.due_date,
          boq_items: []
        });
      }

      const milestone = milestonesMap.get(row.milestone_id);

      if (row.milestone_boq_id) {
        let boqItem = milestone.boq_items.find(b => b.milestone_boq_id === row.milestone_boq_id);

        if (!boqItem) {
          boqItem = {
            milestone_boq_id: row.milestone_boq_id,
            boq_id: row.boq_id,
            item_no: row.item_no,
            description: row.boq_description,
            unit: row.boq_unit,
            quantity: row.boq_quantity,
            unit_cost: row.boq_unit_cost,
            total_cost: row.boq_total_cost,
            mto_items: []
          };
          milestone.boq_items.push(boqItem);
        }

        if (row.mto_id) {
          boqItem.mto_items.push({
            mto_id: row.mto_id,
            description: row.mto_description,
            unit: row.mto_unit,
            quantity: row.mto_quantity,
            unit_cost: row.mto_unit_cost,
            total_cost: row.mto_total_cost
          });
        }
      }
    });

    const milestones = Array.from(milestonesMap.values());
    res.json({ milestones });
  });
};

const signInPerson = (req, res) => {
  const { contractId } = req.params;

  if (!contractId) {
    return res.status(400).json({ error: "Missing contractId" });
  }

  const query = `
    UPDATE contracts
    SET sign_method = 'in_person'
    WHERE id = ?
  `;

  db.query(query, [contractId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to update sign method" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json({
      success: true,
      message: "Contract marked for in-person signing",
    });
  });
};

const uploadSignInPersonContract = (req, res) => {
  // Configure multer specifically for signed contracts
  const signedContractStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure signed directory exists
      if (!fs.existsSync(signedDir)) {
        fs.mkdirSync(signedDir, { recursive: true });
      }
      cb(null, signedDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileName = `signed_contract_${req.params.contractId}_${Date.now()}${ext}`;
      cb(null, fileName);
    }
  });

  const signedContractUpload = multer({
    storage: signedContractStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  }).single("signature_photo");

  signedContractUpload(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: "Failed to upload file: " + err.message });
    }

    const { contractId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/signed_contracts/${req.file.filename}`;

    const updateQuery = `
      UPDATE contracts
      SET status = 'signed',
          sign_method = 'in_person',
          contract_file_url = ?,
          contract_signed_at = NOW()
      WHERE id = ?
    `;

    db.query(updateQuery, [fileUrl, contractId], (dbErr, result) => {
      if (dbErr) {
        console.error("Database error:", dbErr);
        return res.status(500).json({ error: "Failed to update contract record" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Contract not found" });
      }

      res.status(200).json({
        success: true,
        message: "In-person signed contract uploaded successfully.",
        fileUrl: `${req.protocol}://${req.get("host")}${fileUrl}`,
        contractId: contractId
      });
    });
  });
};

const regenerateContract = (req, res) => {
  const { contractId } = req.params;
  const { start_date, end_date, scope_of_work } = req.body;

  // --- Basic validation ---
  if (!start_date || !end_date) {
    return res.status(400).json({ error: "Start and end date are required." });
  }

  if (new Date(start_date) >= new Date(end_date)) {
    return res.status(400).json({ error: "End date must be after start date." });
  }

  const query = `
    SELECT 
      c.id AS contract_id,
      c.proposal_id,
      c.lead_id,
      l.client_name,
      l.email AS client_email,
      l.phone_number AS client_phone,
      l.project_interest,
      p.title,
      p.description,
      p.scope_of_work,
      p.budget_estimate,
      p.start_date AS proposal_start,
      p.end_date AS proposal_end,
      pt.name AS payment_term_label
    FROM contracts c
    JOIN proposals p ON c.proposal_id = p.id
    JOIN leads l ON c.lead_id = l.id
    LEFT JOIN payment_terms pt ON p.payment_term_id = pt.id
    WHERE c.id = ?
  `;

  db.query(query, [contractId], async (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error." });
    }

    if (!result.length) {
      return res.status(404).json({ error: "Contract not found." });
    }

    const data = result[0];

    // --- Prepare merged data ---
    const newScopeOfWork = Array.isArray(scope_of_work)
      ? scope_of_work
      : JSON.parse(data.scope_of_work || "[]");

    const formData = {
      title: data.title,
      description: data.description,
      scope_of_work: newScopeOfWork,
      budget_estimate: data.budget_estimate,
      start_date,
      end_date,
      payment_terms:
        data.payment_term_label ||
        "50% down payment, 30% upon completion, 20% upon final acceptance",
    };

    const selectedLead = {
      client_name: data.client_name,
      email: data.client_email,
      phone_number: data.client_phone,
      project_interest: data.project_interest,
      lead_id: data.lead_id,
    };

    try {
      // --- Render updated contract PDF ---
      const html = await ejs.renderFile(
        path.join(__dirname, "../templates/contract_template.ejs"),
        { selectedLead, formData }
      );

      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({ format: "A4" });
      await browser.close();

      // --- Save new file ---
      const fileName = `contract_${contractId}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, "../public/contracts", fileName);
      fs.writeFileSync(filePath, pdfBuffer);
      const fileUrl = `/contracts/${fileName}`;

      // --- Update proposal and contract together ---
      const updateProposalQuery = `
        UPDATE proposals
        SET scope_of_work = ?
        WHERE id = ?
      `;

      const updateContractQuery = `
      UPDATE contracts
      SET 
        contract_file_url = ?, 
        start_date = ?, 
        end_date = ?, 
        approval_status = 'pending',       -- reset Finance status
        status = 'draft',                  -- reset Client signing status
        finance_rejection_notes = NULL,    -- clear Finance rejection notes
        client_rejection_notes = NULL,     -- clear Client rejection notes
        updated_at = NOW()
      WHERE id = ?;
      `;

      db.beginTransaction((txErr) => {
        if (txErr) {
          console.error("Transaction start error:", txErr);
          return res.status(500).json({ error: "Failed to start transaction." });
        }

        // Update proposal first
        db.query(updateProposalQuery, [JSON.stringify(newScopeOfWork), data.proposal_id], (propErr) => {
          if (propErr) {
            console.error("Proposal update error:", propErr);
            return db.rollback(() =>
              res.status(500).json({ error: "Failed to update proposal scope of work." })
            );
          }

          // Then update contract
          db.query(
            updateContractQuery,
            [fileUrl, start_date, end_date, contractId],
            (contractErr) => {
              if (contractErr) {
                console.error("Contract update error:", contractErr);
                return db.rollback(() =>
                  res.status(500).json({ error: "Failed to update contract record." })
                );
              }

              db.commit((commitErr) => {
                if (commitErr) {
                  console.error("Transaction commit error:", commitErr);
                  return db.rollback(() =>
                    res.status(500).json({ error: "Failed to commit transaction." })
                  );
                }

                const approvalLink = `${process.env.FRONTEND_URL}/contract/respond/${contractId}`;
                return res.status(200).json({
                  message:
                    "Contract regenerated successfully. Status reset to pending review.",
                  contractId,
                  fileUrl,
                  approvalLink,
                });
              });
            }
          );
        });
      });
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
      res.status(500).json({ error: "Failed to regenerate contract PDF." });
    }
  });
};

const modifyProposal = (req, res) => {
  uploadProposalPDF(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err.message);
      return res.status(400).json({ error: err.message });
    }

    const proposal_id = req.params.proposal_id;
    const {
      title,
      description,
      scope_of_work,
      start_date,
      end_date,
      payment_term_id,
      payment_terms,
      budget_estimate,
      client_email,
      client_name,
    } = req.body;

    if (
      !title ||
      !description ||
      !scope_of_work ||
      !start_date ||
      !end_date ||
      !payment_term_id ||
      !payment_terms ||
      !budget_estimate ||
      !client_email ||
      !client_name
    ) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Validate and parse scope_of_work
    let parsedScope;
    try {
      parsedScope = JSON.parse(scope_of_work);
      if (!Array.isArray(parsedScope)) throw new Error("Not an array");
    } catch (parseErr) {
      console.error("Invalid scope_of_work format:", parseErr);
      return res.status(400).json({ error: "Invalid format for scope_of_work. Must be a JSON array." });
    }

    const newFileUrl = req.file ? `/uploads/proposals/${req.file.filename}` : null;

    // Check existing proposal
    const fetchQuery = `SELECT * FROM proposals WHERE id = ? LIMIT 1`;
    db.query(fetchQuery, [proposal_id], (fetchErr, fetchResult) => {
      if (fetchErr) {
        console.error("Database error fetching proposal:", fetchErr);
        return res.status(500).json({ error: "Failed to fetch proposal." });
      }

      if (!fetchResult.length) {
        return res.status(404).json({ error: "Proposal not found." });
      }

      const existingProposal = fetchResult[0];
      const finalFileUrl = newFileUrl || existingProposal.file_url;

      // Reset status to pending when modified
      const updateQuery = `
        UPDATE proposals 
        SET 
          title = ?,
          description = ?,
          scope_of_work = ?,
          start_date = ?,
          end_date = ?,
          payment_term_id = ?,
          payment_terms = ?,
          budget_estimate = ?,
          file_url = ?,
          status = 'pending',
          updated_at = NOW()
        WHERE id = ?
      `;

      const values = [
        title,
        description,
        JSON.stringify(parsedScope),
        start_date,
        end_date,
        payment_term_id,
        payment_terms,
        budget_estimate,
        finalFileUrl,
        proposal_id,
      ];

      db.query(updateQuery, values, (updateErr) => {
        if (updateErr) {
          console.error("Database error updating proposal:", updateErr);
          return res.status(500).json({ error: "Failed to update proposal." });
        }

        // Fetch updated record
        const selectUpdated = `SELECT * FROM proposals WHERE id = ? LIMIT 1`;
        db.query(selectUpdated, [proposal_id], (selErr, updatedRes) => {
          if (selErr) {
            console.error("Error fetching updated proposal:", selErr);
            return res.status(500).json({ error: "Proposal updated but fetch failed." });
          }

          const updatedProposal = updatedRes[0];
          const approvalLink = `${process.env.FRONTEND_URL}/proposal/respond/${updatedProposal.approval_token}`;

          // Send updated email
          const mailOptions = {
            from: `"DUV ENGINEERS" <${process.env.SMTP_EMAIL}>`,
            to: client_email,
            subject: `Updated Proposal - ${title}`,
            html: `
              <p>Dear ${client_name || "Valued Client"},</p>

              <p>We have updated your proposal <strong>"${title}"</strong> and it is now ready for your review.</p>

              <p><strong>Access your updated proposal here:</strong><br>
              <a href="${approvalLink}" target="_blank" style="color: #4c735c; text-decoration: underline;">${approvalLink}</a></p>

              <p>The proposal reflects the latest revisions discussed. We are available to address any questions you may have.</p>

              <p>Thank you for considering DUV ENGINEERS for your project needs.</p>

              <br>

              <p>Sincerely,<br>
              <strong>The DUV ENGINEERS Team</strong></p>
            `,
          };

          transporter.sendMail(mailOptions, (emailErr, info) => {
            if (emailErr) {
              console.error("Error sending email:", emailErr);
              // Don’t fail the main flow if email fails
            } else {
              console.log("Update email sent:", info.response);
            }
          });

          return res.status(200).json({
            message: "Proposal updated successfully and email sent to client.",
            proposal: updatedProposal,
            approvalLink,
          });
        });
      });
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
  uploadClientSignature,
  getApprovedContracts,
  sendContractToClient,
  clientRejectContract,
  getPaymentTerms,
  createSiteVisit,
  getScheduledSiteVisits, 
  getForProcurement,
  signInPerson,
  uploadSignInPersonContract,
  regenerateContract,
  modifyProposal
};