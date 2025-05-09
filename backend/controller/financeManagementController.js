const db = require("../config/db");

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
        ps.created_at AS payslip_created_at,
        creator.full_name AS created_by_name,
        pi.id AS payslip_item_id,
        pr.id AS payroll_id,
        u.full_name AS employee_name,
        pr.total_hours_worked,
        pr.calculated_salary,
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
  
    // Update the finance status of the payslip
    const updatePayslipQuery = `UPDATE payslip 
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
  
      // Update the finance status of the payslip items
      const updatePayslipItemsQuery = `UPDATE payslip_items 
        SET finance_status = ?, finance_rejection_remarks = ?
        WHERE payslip_id = ?`;
  
      db.query(updatePayslipItemsQuery, [status, remarks || null, payslipId], (err2, result2) => {
        if (err2) {
          console.error("Error updating payslip items' finance status:", err2);
          return res.status(500).json({ error: "Failed to update payslip items' finance status." });
        }
  
        res.json({ message: `Payslip and associated items have been ${status}.` });
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


  
  


module.exports = { getFinance, updatePayrollStatus, getApprovedPayslips,
  financeUpdatePayslipStatus, financeProcessPayslipPayment, getCeoApprovedPayslips
 };