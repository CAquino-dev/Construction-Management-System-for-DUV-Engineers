const db = require("../config/db");

const manageAttendance = (req, res) => {

}
//working
const getEmployeeSalary = (req, res) => {
    query = `SELECT 
        e.id AS employee_id,
        e.full_name,
        e.email,
        e.username,
        e.status,
        e.profile_picture,
        e.department_id,
        es.fixed_salary,
        es.bonus,
        es.deductions
        FROM 
        users e
        LEFT JOIN 
        employee_salary es ON e.id = es.employee_id;
        `;
    
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json(results)
        })
    }


    //working
    const calculateEmployeeSalary = (req, res) => {
        const { startDate, endDate, generatedBy } = req.body;
    
        // Step 1: Check if payroll already exists for this period
        const existingQuery = `
            SELECT 
            p.*, e.full_name AS employee_name
            FROM payroll p
            JOIN users e ON p.employee_id = e.id
            WHERE p.period_start = ? AND p.period_end = ?
        `;
    
        db.query(existingQuery, [startDate, endDate], (existErr, existingRows) => {
            if (existErr) {
                console.error("Payroll fetch error:", existErr);
                return res.status(500).json({ error: "Failed to check existing payroll" });
            }
    
            // If payroll records already exist for this period, return them
            if (existingRows.length > 0) {
                return res.json({
                    message: "Payroll already exists for this period. Fetched existing records.",
                    type: "existing",
                    payrollData: existingRows
                });
            }
    
            // Step 2: Proceed to calculate and insert new payroll
            const calculationQuery = `
              SELECT 
                  e.id AS employee_id,
                  es.fixed_salary,
                  ROUND(SUM(TIMESTAMPDIFF(SECOND, a.check_in, a.check_out)) / 3600, 2) AS total_hours_worked,
                  ROUND(
                      (SUM(TIMESTAMPDIFF(SECOND, a.check_in, a.check_out)) / 3600) 
                      / 120 * (es.fixed_salary / 2), 2
                  ) AS calculated_salary  
              FROM users e
              JOIN employee_salary es ON e.id = es.employee_id
              JOIN attendance a ON e.id = a.employee_id
              WHERE a.status = 'Present' 
                  AND a.check_in BETWEEN ? AND ?
              GROUP BY e.id, es.fixed_salary`;
    
            db.query(calculationQuery, [startDate, endDate], (calcErr, results) => {
                if (calcErr) {
                    console.error("Payroll calculation error:", calcErr);
                    return res.status(500).json({ error: "Failed to calculate payroll" });
                }
    
                if (results.length === 0) {
                    return res.status(400).json({ message: "No attendance found for this period." });
                }
    
                const payrollData = results.map(row => [
                    row.employee_id,
                    startDate,
                    endDate,
                    row.total_hours_worked,
                    row.calculated_salary,
                    'Pending',
                    generatedBy,
                    new Date()
                ]);

                console.log(payrollData);

                const insertQuery = `
                    INSERT INTO payroll 
                    (employee_id, period_start, period_end, total_hours_worked, calculated_salary, status, generated_by, generated_at)
                    VALUES ?`;
    
                db.query(insertQuery, [payrollData], (insertErr) => {
                    if (insertErr) {
                        console.error("Insert error:", insertErr);
                        return res.status(500).json({ error: "Failed to insert payroll" });
                    }
    
                    res.json({
                        message: "Payroll successfully generated.",
                        type: "new",
                        insertedCount: payrollData.length
                    });
                });
            });
        });
    };
    
    
    //working
    const getPayrollRecords = (req, res) => {
        const { period_start, period_end } = req.query;
    
        if (!period_start || !period_end) {
            return res.status(400).json({ error: "Missing required date range parameters." });
        }
    
        const query = `
SELECT 
    e.employee_id,               -- Get employee_id from the users table
    e.full_name,
    p.period_start,
    p.period_end,
    p.total_hours_worked,
    p.calculated_salary,
    p.status,
    p.generated_by,
    p.generated_at,
    es.fixed_salary,
    d.name AS department_name    -- Get the department name
FROM payroll p
JOIN users e ON p.employee_id = e.id   -- Use the id from users table (since payroll's employee_id links to users' id)
JOIN employee_salary es ON p.employee_id = es.employee_id
JOIN departments d on e.department_id = d.id
WHERE p.period_start >= ? AND p.period_end <= ?
ORDER BY p.period_end DESC;

;
        `;
    
        db.query(query, [period_start, period_end], (err, results) => {
            if (err) {
                console.error("Error fetching payroll records:", err);
                return res.status(500).json({ error: "Failed to retrieve payroll records." });
            }
    
            res.json(results);
        });
    };  

//working
const getPresentEmployee = (req, res) => {
    const { date } = req.body;

    // Basic validation for date format (assuming 'YYYY-MM-DD')
    if (!date || !/\d{4}-\d{2}-\d{2}/.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Please use 'YYYY-MM-DD'." });
    }

    const query = `
        SELECT 
            e.employee_id AS employee_id,
            e.full_name,
            e.email,
            a.check_in,
            a.check_out,
            a.status AS attendance_status,
            TIMESTAMPDIFF(HOUR, a.check_in, a.check_out) AS hours_worked
        FROM 
            users e
        JOIN 
            attendance a ON e.id = a.employee_id
        WHERE 
            DATE(a.check_in) = ?;
        `;

    db.query(query, [date], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        // Check if no records found
        if (results.length === 0) {
            return res.status(404).json({ message: "No employees were present on the selected date." });
        }

        res.json(results);
    });
};
//working
const getEmployeeAttendance = (req, res) => {
    const query = `        SELECT 
            e.employee_id AS employee_id,
            e.full_name,
            e.email,
            a.check_in,
            a.check_out,
            a.status AS attendance_status,
            SEC_TO_TIME(TIMESTAMPDIFF(SECOND, check_in, check_out)) AS hours_worked
        FROM 
            users e
        JOIN 
            attendance a ON e.id = a.employee_id
       `;
       
       db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results)
       });
}

const updatePayrollStatus = (req, res) => {
    const { selectedPayrollIds, hrUserId, remarks, newStatus } = req.body;

    if (!selectedPayrollIds || selectedPayrollIds.length === 0) {
        return res.status(400).json({ error: "No payroll records selected for update." });
    }

    if (!["Approved by HR", "Rejected by HR", "Pending"].includes(newStatus)) {
        return res.status(400).json({ error: "Invalid status provided." });
    }

    const query = `
        UPDATE payroll 
        SET status = ?, approved_by = ?, approved_by_hr_at = NOW(), remarks = ?
        WHERE id IN (?)
    `;

    db.query(query, [newStatus, hrUserId, remarks, selectedPayrollIds], (err, result) => {
        if (err) {
            console.error("Database error during payroll status update:", err);
            return res.status(500).json({ error: "Failed to update payroll status." });
        }

        res.json({ message: `Payroll records updated successfully to ${newStatus}.` });
    });
};

const createPayslip = (req, res) => {
    const { createdBy, title, remarks, startDate, endDate } = req.body;

    if (!createdBy || !title || !startDate || !endDate) {
        return res.status(400).json({ error: "Title, startDate, and endDate are required." });
    }

    // Step 1: Fetch payrolls within the date range
    const payrollQuery = `
        SELECT id FROM payroll
        WHERE period_start = ? AND period_end = ?
    `;

    db.query(payrollQuery, [startDate, endDate], (err, payrollRows) => {
        if (err) {
            console.error("Error fetching payrolls:", err);
            return res.status(500).json({ error: "Database error during payroll fetch." });
        }

        if (payrollRows.length === 0) {
            return res.status(404).json({ error: "No payrolls found for the selected period." });
        }

        // Step 2: Insert into payslip table
        const payslipInsert = `
            INSERT INTO payslip (title, period_start, period_end, created_by) VALUES (?, ?, ?, ?)
      `;
        db.query(payslipInsert, [title, startDate, endDate, createdBy], (err, result) => {
            if (err) {
                console.error("Error creating payslip:", err);
                return res.status(500).json({ error: "Failed to create payslip." });
            }

            const payslipId = result.insertId;

            // Step 3: Insert into payslip_items
            const payslipItems = payrollRows.map(p => [payslipId, p.id]);
            const itemsInsert = `
                INSERT INTO payslip_items (payslip_id, payroll_id) VALUES ?
            `;

            db.query(itemsInsert, [payslipItems], (err) => {
                if (err) {
                    console.error("Error inserting payslip items:", err);
                    return res.status(500).json({ error: "Failed to link payrolls to payslip." });
                }

                res.json({
                    message: "Payslip created successfully.",
                    payslipId,
                    totalPayrolls: payslipItems.length
                });
            });
        });
    });
};

const getPayslips = (req, res) => {
    const query = `
      SELECT 
        ps.id, 
        ps.title, 
        ps.period_start, 
        ps.period_end, 
        ps.created_at,
        ps.remarks,
        u.full_name AS created_by_name
      FROM payslip ps
      LEFT JOIN users u ON ps.created_by = u.id
      ORDER BY ps.created_at DESC
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Fetch payslips error:", err);
        return res.status(500).json({ error: "Failed to fetch payslips" });
      }
      res.json(results);
    });
  };

//   const getPayslipById = (req, res) => {
//     const payslipId = req.params.id;
  
//     const payslipQuery = `
//       SELECT * FROM payslip WHERE id = ?
//     `;
//     const itemsQuery = `
//       SELECT 
//         pi.employee_id,
//         u.full_name AS employee_name,
//         pi.total_hours_worked,
//         pi.calculated_salary
//       FROM payslip_items pi
//       JOIN users u ON pi.employee_id = u.id
//       WHERE pi.payslip_id = ?
//     `;
  
//     db.query(payslipQuery, [payslipId], (err, payslipResult) => {
//       if (err || payslipResult.length === 0) {
//         return res.status(404).json({ error: "Payslip not found" });
//       }
  
//       db.query(itemsQuery, [payslipId], (err, items) => {
//         if (err) {
//           return res.status(500).json({ error: "Failed to fetch payslip items" });
//         }
  
//         res.json({
//           ...payslipResult[0],
//           items,
//         });
//       });
//     });
//   };


// const getPayslips = (req, res) => {
//     const query = `
//       SELECT 
//         ps.id AS payslip_id, 
//         ps.title, 
//         ps.period_start, 
//         ps.period_end, 
//         ps.created_at,
//         u.full_name AS created_by_name,
//         GROUP_CONCAT(pi.id) AS payslip_item_ids
//       FROM payslip ps
//       LEFT JOIN users u ON ps.created_by = u.id
//       LEFT JOIN payslip_items pi ON pi.payslip_id = ps.id
//       GROUP BY ps.id, ps.title, ps.period_start, ps.period_end, ps.created_at, u.full_name
//       ORDER BY ps.created_at DESC
//     `;
  
//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("Fetch payslips error:", err);
//         return res.status(500).json({ error: "Failed to fetch payslips" });
//       }
  
//       // Optionally parse the item IDs into an array
//       const formatted = results.map(row => ({
//         ...row,
//         payslip_item_ids: row.payslip_item_ids ? row.payslip_item_ids.split(',').map(Number) : [],
//       }));
  
//       res.json(formatted);
//     });
//   };
  
  
const getPayslipById = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Payslip ID is required" });
    }

    const query = `
        SELECT 
            ps.id AS payslip_id,
            ps.title,
            ps.period_start,
            ps.period_end,
            ps.created_at AS payslip_created_at,
            pi.id AS payslip_item_id,
            pr.id AS payroll_id,
            u.full_name AS employee_name,
            pr.total_hours_worked,
            pr.calculated_salary,
            pi.hr_status
        FROM payslip ps
        LEFT JOIN payslip_items pi ON ps.id = pi.payslip_id
        LEFT JOIN payroll pr ON pi.payroll_id = pr.id
        LEFT JOIN users u ON pr.employee_id = u.id
        WHERE ps.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error fetching payslip:", err);
            return res.status(500).json({ error: "Failed to fetch payslip" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Payslip not found" });
        }

        // Structure the response
        const payslip = {
            id: results[0].payslip_id,
            title: results[0].title,
            period_start: results[0].period_start,
            period_end: results[0].period_end,
            created_at: results[0].payslip_created_at,
            items: results.map(row => ({
                payslip_item_id: row.payslip_item_id,
                payroll_id: row.payroll_id,
                employee_name: row.employee_name,
                total_hours_worked: row.total_hours_worked,
                calculated_salary: row.calculated_salary,
                status: row.hr_status
            }))
        };

        res.json({
            message: "Payslip fetched successfully",
            data: payslip
        });
    });
};

const updatePayslipItemStatus = (req, res) => {
    const { selectedItemIds, newStatus, remarks } = req.body;

    if (!selectedItemIds || selectedItemIds.length === 0) {
        return res.status(400).json({ error: "No payslip items selected for update." });
    }

    if (!["Approved by HR", "Rejected by HR"].includes(newStatus)) {
        return res.status(400).json({ error: "Invalid status provided." });
    }

      // If the status is "Rejected by HR", remarks must be provided
    if (newStatus === "Rejected by HR" && !remarks) {
      return res.status(400).json({ error: "Remarks are required when rejecting a payslip." });
    }

    const query = `
        UPDATE payslip_items
        SET hr_status = ?,
        remarks = ?
        WHERE id IN (?)
    `;

    db.query(query, [newStatus, remarks || null, selectedItemIds], (err, result) => {
        if (err) {
            console.error("Database error during payslip item status update:", err);
            return res.status(500).json({ error: "Failed to update payslip item status." });
        }

        res.json({ message: `Payslip item status updated successfully to ${newStatus}.` });
    });
};

const updatePayslipStatus = (req, res) => {
  const { payslipId, status, remarks } = req.body;

  // Validate the request
  if (!payslipId || !["Approved by HR", "Rejected by HR"].includes(status)) {
      return res.status(400).json({ error: "Invalid request. Check payslipId and status." });
  }

  // If the status is "Rejected by HR", remarks must be provided
  if (status === "Rejected by HR" && !remarks) {
      return res.status(400).json({ error: "Remarks are required when rejecting a payslip." });
  }

  // Prepare the query to update the payslip status and remarks
  const query = `UPDATE payslip 
                 SET hr_status = ?, 
                  hr_rejection_remarks = ? 
                 WHERE id = ?`;

  // Execute the query
  db.query(query, [status, remarks || null, payslipId], (err, result) => {
      if (err) {
          console.error("Error updating payslip status:", err);
          return res.status(500).json({ error: "Failed to update payslip status." });
      }

      // If no rows were affected, return a 404 error
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Payslip not found." });
      }

      // Return success message
      res.json({ message: `Payslip has been ${status}.` });
  });
};



  





module.exports = { getEmployeeSalary, getPresentEmployee, calculateEmployeeSalary, 
                getEmployeeAttendance, getPayrollRecords, updatePayrollStatus, 
                createPayslip, getPayslips, getPayslipById, updatePayslipItemStatus, 
                updatePayslipStatus};