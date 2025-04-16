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
  


module.exports = { getFinance, updatePayrollStatus };