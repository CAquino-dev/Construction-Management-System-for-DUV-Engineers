const db = require("../config/db");
const fs = require('fs');
const path = require('path');

const getFinance = (req, res) => {
    const query = `SELECT 
    p.id AS payroll_id,
    e.id AS employee_id,
    e.full_name AS employee_name,
    p.period_start,
    p.period_end,
    p.total_hours_worked,
    p.calculated_salary,
    p.status,
    approver.full_name AS approved_by_hr,
    p.approved_by_hr_at,
    p.remarks
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    LEFT JOIN employees approver ON p.approved_by = approver.id
    WHERE p.status = 'Approved by HR'
    ORDER BY p.approved_by_hr_at DESC
    LIMIT 0, 25;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch finance records" });
        res.json(results);
    })
}

const updatePayrollStatus = (req, res) => {
    const { id, newStatus, userId } = req.body;
  
    if (!id || !newStatus || !userId) {
      return res.status(400).json({ error: "Missing id, newStatus, or userId" });
    }
  
    let query = "UPDATE payroll SET status = ?, ";
    let values = [];
  
    if (newStatus === "Paid") {
      query += "paid_by = ?, paid_by_finance_at = NOW() WHERE id = ?";
      values = [newStatus, userId, id];
    } else if (newStatus === "Rejected by Finance") {
      query += "rejected_by_finance = ?, rejected_at = NOW() WHERE id = ?";
      values = [newStatus, userId, id];
    } else {
      // For other statuses, just update the status field
      query += "WHERE id = ?";
      values = [newStatus, id];
    }
  
    db.query(query, values, (err, results) => {
      if (err) return res.status(500).json({ error: "Failed to update payroll status" });
      res.json({ message: "Status updated successfully" });
    });
  };

const getApprovedPayslips = (req, res) => {
  const query = `
    SELECT 
        ps.id AS payslip_id,
        ps.title,
        ps.period_start,
        ps.period_end,
        ps.remarks,
        ps.created_at AS payslip_created_at,
        creator.full_name AS created_by_name,
        pi.id AS payslip_item_id,
        pr.id AS payroll_id,
        u.full_name AS employee_name,
        pr.total_hours_worked,
        pr.calculated_salary,
        pr.overtime_pay,
        pr.philhealth_deduction,
        pr.sss_deduction,
        pr.pagibig_deduction,
        pr.total_deductions,
        pr.final_salary,
        pi.hr_status,
        pi.finance_status
    FROM payslip ps
    LEFT JOIN users creator ON ps.created_by = creator.id
    LEFT JOIN payslip_items pi ON ps.id = pi.payslip_id
    LEFT JOIN payroll pr ON pi.payroll_id = pr.id
    LEFT JOIN users u ON pr.employee_id = u.id
    WHERE ps.hr_status = 'Approved by HR' 
      AND pi.hr_status = 'Approved by HR'
      AND pi.finance_status = 'Pending'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching approved payslips:", err);
      return res.status(500).json({ error: "Failed to fetch approved payslips." });
    }

    // Group by payslip_id
    const grouped = {};
    results.forEach(row => {
      if (!grouped[row.payslip_id]) {
        grouped[row.payslip_id] = {
          payslip_id: row.payslip_id,
          title: row.title,
          period_start: row.period_start,
          period_end: row.period_end,
          payslip_created_at: row.payslip_created_at,
          created_by_name: row.created_by_name,
          items: []
        };
      }

      grouped[row.payslip_id].items.push({
        payslip_item_id: row.payslip_item_id,
        payroll_id: row.payroll_id,
        employee_name: row.employee_name,
        total_hours_worked: row.total_hours_worked,
        calculated_salary: row.calculated_salary,
        overtime_pay: row.overtime_pay,
        philhealth_deduction: row.philhealth_deduction,
        sss_deduction: row.sss_deduction,
        pagibig_deduction: row.pagibig_deduction,
        total_deductions: row.total_deductions,
        final_salary: row.final_salary,
        status: row.hr_status,
        finance_status: row.finance_status
      });
    });

    const formatted = Object.values(grouped);
    res.json({
      success: true,
      message: "Approved payslips fetched successfully",
      data: formatted
    });
  });
};



const financeUpdatePayslipStatus = (req, res) => {
  const { payslipId, status, remarks, approvedBy } = req.body;

  if (!payslipId || !["Approved by Finance", "Rejected by Finance"].includes(status)) {
    return res.status(400).json({ error: "Invalid request. Check payslipId and status." });
  }

  // Step 1: Update the finance status of the payslip
  const updatePayslipQuery = `
    UPDATE payslip 
    SET finance_status = ?, finance_rejection_remarks = ?, approved_by_id = ?, approved_at = NOW() 
    WHERE id = ?`;
  
  db.query(updatePayslipQuery, [status, remarks || null, approvedBy, payslipId], (err, result) => {
    if (err) {
      console.error("Error updating payslip status:", err);
      return res.status(500).json({ error: "Failed to update payslip status." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payslip not found." });
    }

    // Step 2: Update the finance status of payslip items
    const updatePayslipItemsQuery = `
      UPDATE payslip_items 
      SET finance_status = ?, finance_rejection_remarks = ?
      WHERE payslip_id = ?`;

    db.query(updatePayslipItemsQuery, [status, remarks || null, payslipId], (err2) => {
      if (err2) {
        console.error("Error updating payslip items' finance status:", err2);
        return res.status(500).json({ error: "Failed to update payslip items' finance status." });
      }

      // ✅ Step 3: If finance approved → mark salaries as Released (not Paid yet)
      if (status === "Approved by Finance") {
        const releaseQuery = `
          UPDATE payslip_items
          SET 
            payment_status = 'Released',
            payment_remarks = ?,
            paid_by = ?,
            paid_at = NOW()
          WHERE payslip_id = ? 
            AND finance_status = 'Approved by Finance'
            AND payment_status = 'Pending'`;

        db.query(releaseQuery, [remarks || "Salaries released by Finance", approvedBy, payslipId], (err3, result3) => {
          if (err3) {
            console.error("Error releasing salaries:", err3);
            return res.status(500).json({ error: "Payslip approved but failed to release salaries." });
          }

          return res.json({ 
            message: `Payslip approved and ${result3.affectedRows} salaries marked as Released.` 
          });
        });
      } else {
        // If rejected → just confirm rejection
        res.json({ message: `Payslip and associated items have been ${status}.` });
      }
    });
  });
};


  const financeProcessPayslipPayment = (req, res) => {
  const { payslipId, paymentStatus, remarks, paidBy } = req.body;

  // Validate the request body
  if (!payslipId || !["Pending", "Paid"].includes(paymentStatus)) {
    return res.status(400).json({ error: "Invalid request. Check payslipId and paymentStatus." });
  }

  // Update the payment status in the payslip_items table
  const updatePayslipPaymentQuery = `UPDATE payslip_items 
    SET payment_status = ?, payment_remarks = ?, paid_by = ?, paid_at = NOW() 
    WHERE payslip_id = ?`;

  db.query(updatePayslipPaymentQuery, [paymentStatus, remarks || null, paidBy, payslipId], (err, result) => {
    if (err) {
      console.error("Error updating payment status:", err);
      return res.status(500).json({ error: "Failed to update payment status." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payslip not found." });
    }

    // If all payslip items are marked as "Paid", update the payslip status to "Paid"
    const checkAllItemsPaidQuery = `SELECT COUNT(*) AS unpaid_count FROM payslip_items 
      WHERE payslip_id = ? AND payment_status != 'Paid'`;

    db.query(checkAllItemsPaidQuery, [payslipId], (err2, result2) => {
      if (err2) {
        console.error("Error checking item payment status:", err2);
        return res.status(500).json({ error: "Failed to check item payment status." });
      }

      const unpaidCount = result2[0].unpaid_count;
      if (unpaidCount === 0) {
        // All items are paid, so update the overall payslip status to "Paid"
        const updatePayslipStatusQuery = `UPDATE payslip 
          SET payment_status = 'Paid' 
          WHERE id = ?`;

        db.query(updatePayslipStatusQuery, [payslipId], (err3, result3) => {
          if (err3) {
            console.error("Error updating payslip status:", err3);
            return res.status(500).json({ error: "Failed to update payslip status." });
          }

          res.json({ message: `Payslip and associated items have been updated with ${paymentStatus}.` });
        });
      } else {
        res.json({ message: `Payslip items have been marked as ${paymentStatus}, awaiting payment for other items.` });
      }
    });
  });
};

const getCeoApprovedPayslips = (req, res) => {
  // SQL query to fetch all payslips that have been approved by the CEO
  const query = `SELECT * FROM payslip WHERE ceo_status = 'Approved by CEO' AND payment_status != 'Paid'`;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching approved payslips:", err);
      return res.status(500).json({ error: "Failed to fetch approved payslips." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No payslips found approved by CEO." });
    }

    // Send the retrieved payslips as a response
    res.json({ payslips: result });
  });
};

const createPayment = (req, res) => {
  const {
    milestone_id,
    payment_date,
    amount_paid,
  } = req.body;

  if (!milestone_id || !payment_date || !amount_paid) {
    return res.status(400).json({ error: 'milestone_id, payment_date, and amount_paid are required' });
  }

  const insertPaymentQuery = `
    INSERT INTO payments
    (milestone_id, payment_date, amount_paid, payment_status, payment_method, remarks, created_at, updated_at)
    VALUES (?, ?, ?, 'Pending', ?, ?, NOW(), NOW())
  `;

  db.query(insertPaymentQuery, [milestone_id, payment_date, amount_paid,  null,   null], (err, result) => {
    if (err) {
      console.error('Error creating payment:', err);
      return res.status(500).json({ error: 'Failed to create payment' });
    }

    // After successful insert, update milestone status
    const updateMilestoneQuery = `
      UPDATE milestones
      SET progress_status = 'Payment Confirmed'
      WHERE id = ?
    `;

    db.query(updateMilestoneQuery, [milestone_id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating milestone status:', updateErr);
        // You can choose to still return success for payment but notify milestone update failed
        return res.status(500).json({ error: 'Payment recorded but failed to update milestone status' });
      }

      res.status(201).json({ message: 'Payment recorded and milestone status updated', paymentId: result.insertId });
    });
  });
};


// Get projects with milestones pending payment
const getProjectsWithPendingPayments = (req, res) => {
  const query = `
    SELECT DISTINCT p.id, p.project_name
    FROM engineer_projects p
    JOIN milestones m ON m.project_id = p.id
    WHERE m.progress_status = 'For Payment'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
};

// Get milestones with 'For Payment' status by project ID
const getMilestonesForPaymentByProject = (req, res) => {
  const projectId = req.params.projectId;

  const query = `
    SELECT id, status, details, payment_amount, due_date
    FROM milestones
    WHERE project_id = ? AND progress_status = 'For Payment'
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching milestones:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
};

const getAllExpensesApprovedByEngineer = (req, res) => {
  const query = `
    SELECT
      expense_id,
      milestone_id,
      expense_type,
      date,
      date_from,
      date_to,
      description,
      quantity,
      unit,
      price_per_qty,
      amount,
      status,
      approved_by,
      approval_date,
      engineer_approval_status,
      finance_approval_status,
      remarks
    FROM expenses
    WHERE finance_approval_status = 'Pending'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching approved expenses:', err);
      return res.status(500).json({ error: 'Failed to fetch approved expenses' });
    }
    res.json({ expenses: results });
  });
};


// PATCH /api/project/expenses/:id/finance-approval
const updateFinanceApprovalStatus = (req, res) => {
  const milestoneId = req.params.id;
  const { status, financeId } = req.body;

  if (!status || !["Finance Approved", "Finance Rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid or missing status" });
  }

  const approvalDate = new Date();

  // 1️⃣ Update milestone status
  const updateMilestoneQuery = `
    UPDATE milestones
    SET status = ?, 
        finance_approved_by = ?, 
        finance_approval_date = ?
    WHERE id = ?
  `;

  db.query(updateMilestoneQuery, [status, financeId, approvalDate, milestoneId], (err, result) => {
    if (err) {
      console.error("Error updating finance approval status:", err);
      return res.status(500).json({ error: "Failed to update finance approval status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    // 2️⃣ If status = Finance Approved → auto-generate Purchase Order
    if (status === "Finance Approved") {
      const getQuoteQuery = `
        SELECT pq.id AS quote_id, pq.supplier_id, pq.milestone_id, m.project_id
        FROM procurement_quotes pq
        JOIN milestones m ON pq.milestone_id = m.id
        WHERE pq.milestone_id = ? AND pq.status = 'Selected'
      `;

      db.query(getQuoteQuery, [milestoneId], (err, results) => {
        if (err) {
          console.error("Error fetching approved quote:", err);
          return res.status(500).json({ message: "Error fetching approved quote" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "No selected supplier quote found" });
        }

        const { quote_id, supplier_id, project_id } = results[0];
        const poNumber = `PO-${Date.now()}`;

        // 3️⃣ Insert into purchase_orders
        const insertPOQuery = `
          INSERT INTO purchase_orders (project_id, milestone_id, quote_id, supplier_id, po_number, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertPOQuery,
          [project_id, milestoneId, quote_id, supplier_id, poNumber, financeId],
          (err, result) => {
            if (err) {
              console.error("Error creating purchase order:", err);
              return res.status(500).json({ message: "Error creating purchase order" });
            }

            const po_id = result.insertId;

            // 4️⃣ Copy all quote items into purchase_order_items
            const copyItemsQuery = `
              INSERT INTO purchase_order_items (po_id, material_name, unit, quantity, unit_price, total_cost)
              SELECT ?, material_name, unit, quantity, unit_price, (quantity * unit_price)
              FROM procurement_quote_items
              WHERE quote_id = ?
            `;

            db.query(copyItemsQuery, [po_id, quote_id], (err2) => {
              if (err2) {
                console.error("Error copying PO items:", err2);
                return res.status(500).json({ message: "Error copying PO items" });
              }

              // 5️⃣ Compute total
              const totalQuery = `
                UPDATE purchase_orders
                SET total_amount = (
                  SELECT SUM(total_cost) FROM purchase_order_items WHERE po_id = ?
                )
                WHERE id = ?
              `;

              db.query(totalQuery, [po_id, po_id], (err3) => {
                if (err3) {
                  console.error("Error computing PO total:", err3);
                  return res.status(500).json({ message: "Error computing PO total" });
                }

                console.log(`✅ Purchase Order generated: ${poNumber}`);
                res.json({
                  message: "Finance approved and Purchase Order generated successfully",
                  po_id,
                  po_number: poNumber,
                });
              });
            });
          }
        );
      });
    } else {
      // 3️⃣ If Finance Rejected, no PO created
      res.json({ message: "Finance rejected milestone successfully" });
    }
  });
};

const getContracts = (req, res) => {
  const query = `
    SELECT 
      contracts.id AS contract_id,
      contracts.contract_file_url,
      contracts.contract_signed_at,
      contracts.status AS contract_status,
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
    WHERE contracts.approval_status = 'pending'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching contracts:', err);
      return res.status(500).json({ error: 'Failed to fetch contracts' });
    }
    res.json(results);
  });
};

const approveContract = (req, res) => {
  const contractId = req.params.id;

  const query = `UPDATE contracts SET approval_status = 'approved' WHERE id = ?`;

  db.query(query, [contractId], (err) => {
    if (err) return res.status(500).json({ error: "Approval failed" });
    res.json({ success: true });
  });
}

const rejectContract = (req, res) => {
  const contractId = req.params.id;
  const { finance_rejection_notes } = req.body;

  if (!finance_rejection_notes) {
    return res.status(400).json({ error: "Rejection notes are required" });
  }

  const query = `UPDATE contracts 
    SET approval_status = 'rejected', finance_rejection_notes = ? 
    WHERE id = ?`;

  db.query(query, [finance_rejection_notes, contractId], (err) => {
    if (err) return res.status(500).json({ error: "Rejection failed" });
    res.json({ success: true });
  });
};

// const getPmApprovedMilestones = (req, res) => {
//   const query = 
//     `    SELECT
//       m.id AS milestone_id,
//       m.project_id,
//       m.timestamp,
//       m.title,
//       m.details,
//       m.status,
//       m.start_date,
//       m.due_date,

//       mb.id AS milestone_boq_id,
//       b.id AS boq_id,
//       b.item_no,
//       b.description AS boq_description,
//       b.unit AS boq_unit,
//       b.quantity AS boq_quantity,
//       b.unit_cost AS boq_unit_cost,
//       b.total_cost AS boq_total_cost,

//       mm.id AS mto_id,
//       mm.description AS mto_description,
//       mm.unit AS mto_unit,
//       mm.quantity AS mto_quantity,
//       mm.unit_cost AS mto_unit_cost,
//       mm.total_cost AS mto_total_cost
//     FROM milestones m
//     LEFT JOIN milestone_boq mb ON m.id = mb.milestone_id
//     LEFT JOIN boq b ON mb.boq_id = b.id
//     LEFT JOIN milestone_mto mm ON mb.id = mm.milestone_boq_id
//     WHERE m.status = 'PM Approved'
//        AND m.finance_approval_status = 'Pending'
//      ORDER BY m.due_date ASC`;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching PM approved milestones:", err);
//       return res.status(500).json({ success: false, error: "Failed Fetching PM approved milestones" });
//     }
//     res.status(200).json({
//       success: true,
//       milestones: results
//     });
//   });
// };

// GET /api/finance/procurement-approved
const getProcurementApprovedMilestones = (req, res) => {
  const query = `
    SELECT 
      m.id AS milestone_id,
      m.project_id,
      m.title,
      m.details,
      m.status,
      m.start_date,
      m.due_date,
      m.timestamp,

      -- Approved supplier quote data
      pq.id AS quote_id,
      pq.supplier_id,
      s.supplier_name,
      pq.status AS quote_status,

      pqi.id AS quote_item_id,
      pqi.material_name,
      pqi.unit AS quote_unit,
      pqi.quantity AS quote_quantity,
      pqi.unit_price AS quote_unit_price,

      -- BOQ data
      b.id AS boq_id,
      b.item_no,
      b.description AS boq_description,
      b.unit AS boq_unit,
      b.quantity AS boq_quantity,
      b.unit_cost AS boq_unit_cost,
      b.total_cost AS boq_total_cost

    FROM milestones m
    LEFT JOIN procurement_quotes pq 
      ON pq.milestone_id = m.id AND pq.status = 'Selected'
    LEFT JOIN suppliers s 
      ON pq.supplier_id = s.id
    LEFT JOIN procurement_quote_items pqi 
      ON pq.id = pqi.quote_id
    LEFT JOIN milestone_boq mb 
      ON m.id = mb.milestone_id
    LEFT JOIN boq b 
      ON mb.boq_id = b.id
    WHERE pq.status = 'Selected'
    ORDER BY m.due_date ASC, s.supplier_name ASC, pqi.material_name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching procurement-approved milestones:", err);
      return res.status(500).json({ message: "Failed to fetch milestones" });
    }

    const milestonesMap = new Map();

    results.forEach((row) => {
      if (!milestonesMap.has(row.milestone_id)) {
        milestonesMap.set(row.milestone_id, {
          milestone_id: row.milestone_id,
          project_id: row.project_id,
          title: row.title,
          details: row.details,
          status: row.status,
          start_date: row.start_date,
          due_date: row.due_date,
          timestamp: row.timestamp,
          approved_supplier: {
            supplier_id: row.supplier_id,
            supplier_name: row.supplier_name,
            quote_id: row.quote_id,
            items: [],
            total_quote: 0,
          },
          boq_items: [],
          boq_total: 0,
          _boq_ids: new Set(), // 🧠 temporary tracker for deduplication
        });
      }

      const milestone = milestonesMap.get(row.milestone_id);

      // ✅ Add supplier quote items
      if (row.quote_item_id) {
        const totalCost =
          parseFloat(row.quote_quantity || 0) *
          parseFloat(row.quote_unit_price || 0);

        milestone.approved_supplier.items.push({
          quote_item_id: row.quote_item_id,
          material_name: row.material_name,
          unit: row.quote_unit,
          quantity: row.quote_quantity,
          unit_price: row.quote_unit_price,
          total_cost: totalCost,
        });

        milestone.approved_supplier.total_quote += totalCost;
      }

      // ✅ Add BOQ items only once per boq_id
      if (row.boq_id && !milestone._boq_ids.has(row.boq_id)) {
        milestone.boq_items.push({
          boq_id: row.boq_id,
          item_no: row.item_no,
          description: row.boq_description,
          unit: row.boq_unit,
          quantity: row.boq_quantity,
          unit_cost: row.boq_unit_cost,
          total_cost: parseFloat(row.boq_total_cost) || 0,
        });

        milestone.boq_total += parseFloat(row.boq_total_cost) || 0;
        milestone._boq_ids.add(row.boq_id); // 🧩 Mark as added
      }
    });

    // 🧹 Remove temporary _boq_ids before sending response
    const milestones = Array.from(milestonesMap.values()).map((m) => {
      delete m._boq_ids;
      return m;
    });

    res.json({ milestones });
  });
};



const uploadSalarySignature = (req, res) => {
  const { base64Signature, payslipItemId, userId } = req.body;

  if (!base64Signature || !payslipItemId || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Ensure salary signature folder exists
  const salarySignatureDir = path.join(__dirname, "../public/salary_signatures");
  if (!fs.existsSync(salarySignatureDir)) {
    fs.mkdirSync(salarySignatureDir, { recursive: true });
  }

  // Save signature file
  const signatureFileName = `salary_signature_${payslipItemId}_${Date.now()}.png`;
  const signatureFilePath = path.join(salarySignatureDir, signatureFileName);

  const base64Data = base64Signature.replace(/^data:image\/png;base64,/, "");
  fs.writeFile(signatureFilePath, base64Data, "base64", (err) => {
    if (err) {
      console.error("Error saving salary signature:", err);
      return res.status(500).json({ error: "Failed to save signature" });
    }

    // Update DB record
    const query = `
      UPDATE payslip_items
      SET payment_status = 'Paid',
          paid_by = ?,
          paid_at = NOW(),
          signature_url = ? 
      WHERE id = ?
    `;

    db.query(
      query,
      [userId, `/salary_signatures/${signatureFileName}`, payslipItemId],
      (dbErr, result) => {
        if (dbErr) {
          console.error("DB error updating payslip item:", dbErr);
          return res.status(500).json({ error: "Database error" });
        }

        return res.status(200).json({
          message: "Salary marked as Paid with signature",
          payslipItemId,
          signatureUrl: `/salary_signatures/${signatureFileName}`,
        });
      }
    );
  });
};

// ✅ Get payslips ready for salary release (Approved by Finance, Released but not Paid)
const getReleasedPayslips = (req, res) => {
  const query = `
    SELECT 
        ps.id AS payslip_id,
        ps.title,
        ps.period_start,
        ps.period_end,
        ps.created_at AS payslip_created_at,
        creator.full_name AS created_by_name,
        pi.id AS payslip_item_id,
        pr.id AS payroll_id,
        e.full_name AS employee_name,
        pr.total_hours_worked,
        pr.calculated_salary,
        pr.overtime_pay,
        pr.philhealth_deduction,
        pr.sss_deduction,
        pr.pagibig_deduction,
        pr.total_deductions,
        pr.final_salary,
        pi.hr_status,
        pi.finance_status,
        pi.payment_status
    FROM payslip ps
    LEFT JOIN users creator ON ps.created_by = creator.id
    LEFT JOIN payslip_items pi ON ps.id = pi.payslip_id
    LEFT JOIN payroll pr ON pi.payroll_id = pr.id
    LEFT JOIN users e ON pr.employee_id = e.id
    WHERE pi.finance_status = 'Approved by Finance'
      AND pi.payment_status = 'Released' -- released but not yet fully paid
    ORDER BY ps.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching payslips for release:", err);
      return res.status(500).json({ error: "Failed to fetch payslips for release." });
    }

    // Group items by payslip
    const grouped = {};
    results.forEach(row => {
      if (!grouped[row.payslip_id]) {
        grouped[row.payslip_id] = {
          payslip_id: row.payslip_id,
          title: row.title,
          period_start: row.period_start,
          period_end: row.period_end,
          payslip_created_at: row.payslip_created_at,
          created_by_name: row.created_by_name,
          items: []
        };
      }

      grouped[row.payslip_id].items.push({
        payslip_item_id: row.payslip_item_id,
        payroll_id: row.payroll_id,
        employee_name: row.employee_name,
        total_hours_worked: row.total_hours_worked,
        calculated_salary: row.calculated_salary,
        overtime_pay: row.overtime_pay,
        philhealth_deduction: row.philhealth_deduction,
        sss_deduction: row.sss_deduction,
        pagibig_deduction: row.pagibig_deduction,
        total_deductions: row.total_deductions,
        final_salary: row.final_salary,
        hr_status: row.hr_status,
        finance_status: row.finance_status,
        payment_status: row.payment_status
      });
    });

    res.json({
      success: true,
      message: "Payslips ready for release fetched successfully",
      data: Object.values(grouped)
    });
  });
};


 


module.exports = { getFinance, updatePayrollStatus, getApprovedPayslips,
  financeUpdatePayslipStatus, financeProcessPayslipPayment, getCeoApprovedPayslips,
  createPayment, getProjectsWithPendingPayments, getMilestonesForPaymentByProject,
  getAllExpensesApprovedByEngineer, updateFinanceApprovalStatus, getContracts, 
  approveContract, rejectContract, getProcurementApprovedMilestones, uploadSalarySignature,
  getReleasedPayslips
 };