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

        if (existingRows.length > 0) {
            return res.json({
                message: "Payroll already exists for this period. Fetched existing records.",
                type: "existing",
                payrollData: existingRows
            });
        }

        // Step 2: Calculate payroll based on attendance
        const calculationQuery = `
            SELECT e.id AS employee_id, es.hourly_rate, a.check_in, a.check_out
            FROM users e
            JOIN employee_salary es ON e.id = es.employee_id
            JOIN attendance a ON e.id = a.employee_id
            WHERE a.status = 'Present' 
              AND a.check_in BETWEEN ? AND ?
        `;

        db.query(calculationQuery, [startDate, endDate], (calcErr, results) => {
            if (calcErr) {
                console.error("Payroll calculation error:", calcErr.message);
                return res.status(500).json({ error: "Failed to calculate payroll", details: calcErr.message });
            }

            if (results.length === 0) {
                return res.status(400).json({ message: "No attendance found for this period." });
            }

            // Step 3: Calculate breakdown for each employee
            const payrollData = [];
            let currentEmployee = null;
            let totalHoursWorked = 0;
            let baseSalary = 0;
            let overtimePay = 0;
            let totalDeductions = 0;
            let overtimeHours = 0;
            let philhealthDeduction = 0;
            let sssDeduction = 0;
            let pagibigDeduction = 0;
            let finalSalary = 0;

            results.forEach(row => {
                // If the current employee changes, process the previous employee's payroll
                if (currentEmployee && currentEmployee !== row.employee_id) {
                    // Calculate final salary
                    finalSalary = baseSalary + overtimePay - totalDeductions;

                    payrollData.push([
                        currentEmployee,
                        startDate,
                        endDate,
                        totalHoursWorked,
                        baseSalary,
                        'Pending', // Status
                        generatedBy,
                        new Date(), // Generated At
                        overtimePay,
                        philhealthDeduction,
                        sssDeduction,
                        pagibigDeduction,
                        totalDeductions,
                        finalSalary
                    ]);

                    // Reset for new employee
                    totalHoursWorked = 0;
                    baseSalary = 0;
                    overtimePay = 0;
                    totalDeductions = 0;
                    overtimeHours = 0;
                    philhealthDeduction = 0;
                    sssDeduction = 0;
                    pagibigDeduction = 0;
                    finalSalary = 0;
                }

                // Calculate hours worked for the day
                const totalSeconds = (new Date(row.check_out) - new Date(row.check_in)) / 1000;
                const dailyHoursWorked = totalSeconds / 3600; // convert seconds to hours
                totalHoursWorked += dailyHoursWorked;

                baseSalary = totalHoursWorked * row.hourly_rate;

                // Calculate overtime (if any)
                const normalWorkingHours = 8; // Assume 8 hours workday
                const daysWorked = (new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24); // Calculate number of days worked
                const maxNormalHours = normalWorkingHours * daysWorked; // Total normal hours for the period

                overtimeHours = totalHoursWorked > maxNormalHours ? totalHoursWorked - maxNormalHours : 0;
                overtimePay = overtimeHours * row.hourly_rate * 1.5; // Overtime rate is 1.5x the hourly rate

                // **Dynamic Deduction Calculations**:
                philhealthDeduction = baseSalary * 0.0225; // 2.25% for employee share
                sssDeduction = baseSalary * 0.0563; // 5.63% for employee share
                pagibigDeduction = baseSalary > 5000 ? 100 : 0; // Fixed Pag-IBIG Deduction for salary > ₱5,000
                totalDeductions = philhealthDeduction + sssDeduction + pagibigDeduction;

                // Update current employee ID
                currentEmployee = row.employee_id;
            });

            // Process the last employee in the loop
            if (currentEmployee) {
                finalSalary = baseSalary + overtimePay - totalDeductions;
                payrollData.push([
                    currentEmployee,
                    startDate,
                    endDate,
                    totalHoursWorked,
                    baseSalary,
                    'Pending',
                    generatedBy,
                    new Date(),
                    overtimePay,
                    philhealthDeduction,
                    sssDeduction,
                    pagibigDeduction,
                    totalDeductions,
                    finalSalary
                ]);
            }

            // Step 4: Insert payroll data into the database
            const insertQuery = `
                INSERT INTO payroll 
                (employee_id, period_start, period_end, total_hours_worked, calculated_salary, status, generated_by, generated_at, 
                 overtime_pay, philhealth_deduction, sss_deduction, pagibig_deduction, total_deductions, final_salary)
                VALUES ?
            `;

            db.query(insertQuery, [payrollData], (insertErr) => {
                if (insertErr) {
                    console.error("Insert error:", insertErr);
                    return res.status(500).json({ error: "Failed to insert payroll" });
                }

                res.json({
                    message: "Payroll successfully generated.",
                    type: "new",
                    insertedCount: payrollData.length,
                    payroll_details: payrollData
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
    e.employee_id AS employee_id,               
    e.full_name,
    p.period_start,
    p.period_end,
    p.total_hours_worked,
    p.calculated_salary,
    p.status,
    p.generated_by,
    p.generated_at,
    p.overtime_pay,
    p.philhealth_deduction,
    p.sss_deduction,
    p.pagibig_deduction,
    p.total_deductions,
    p.final_salary,
    d.name AS department_name,          
    es.hourly_rate                      
FROM payroll p
JOIN users e ON p.employee_id = e.id   
JOIN departments d on e.department_id = d.id
JOIN employee_salary es ON e.id = es.employee_id 
WHERE p.period_start >= ? AND p.period_end <= ?
ORDER BY p.period_end DESC;
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
            INSERT INTO payslip (title, period_start, remarks, period_end, created_by) VALUES (?, ?, ?, ?, ?)
      `;
        db.query(payslipInsert, [title, startDate, remarks, endDate, createdBy], (err, result) => {
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
    WHERE ps.hr_status = 'Pending'
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
            pr.overtime_pay,
            pr.philhealth_deduction,
            pr.sss_deduction,
            pr.pagibig_deduction,
            pr.total_deductions,
            pr.final_salary,
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
                overtime_pay: row.overtime_pay,
                philhealth_deduction: row.philhealth_deduction,
                sss_deduction: row.sss_deduction,
                pagibig_deduction: row.pagibig_deduction,
                total_deductions: row.total_deductions,
                final_salary: row.final_salary,
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