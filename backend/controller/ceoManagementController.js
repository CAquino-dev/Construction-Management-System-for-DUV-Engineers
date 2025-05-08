const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config();

const getFinanceApprovedPayslips = (req, res) => {
    const query = ` 
        SELECT 
            un.full_name AS approved_by_name,
            ps.id AS payslip_id,
            ps.title,
            ps.period_start,
            ps.period_end,
            ps.created_at AS payslip_created_at,
            ps.approved_at,  -- Added approved_at
            creator.full_name AS created_by_name,
            pi.id AS payslip_item_id,
            pr.id AS payroll_id,
            u.full_name AS employee_name,
            pr.total_hours_worked,
            pr.calculated_salary,
            pi.finance_status
        FROM payslip ps
        LEFT JOIN users un ON ps.approved_by_id = un.id
        LEFT JOIN users creator ON ps.created_by = creator.id
        LEFT JOIN payslip_items pi ON ps.id = pi.payslip_id
        LEFT JOIN payroll pr ON pi.payroll_id = pr.id
        LEFT JOIN users u ON pr.employee_id = u.id
        WHERE ps.finance_status = 'Approved by Finance' AND pi.finance_status = 'Approved by Finance'
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
                    approved_at: row.approved_at,  // Added approved_at to grouped object
                    created_by_name: row.created_by_name,
                    approved_by_name: row.approved_by_name,
                    items: []
                };
            }

            grouped[row.payslip_id].items.push({
                payslip_item_id: row.payslip_item_id,
                payroll_id: row.payroll_id,
                employee_name: row.employee_name,
                total_hours_worked: row.total_hours_worked,
                calculated_salary: row.calculated_salary,
                status: row.finance_status
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


module.exports = {  getFinanceApprovedPayslips };