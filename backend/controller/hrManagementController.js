const db = require("../config/db");

const manageAttendance = (req, res) => {

}

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
        employees e
        LEFT JOIN 
        employee_salary es ON e.id = es.employee_id;
        `;
    
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json(results)
        })
    }

const calculateEmployeeSalary = (req, res) => {
    const { startDate, endDate } = req.body;

    const query = `SELECT 
            e.id AS employee_id,
            e.full_name,
            es.fixed_salary,
            SUM(TIMESTAMPDIFF(SECOND, a.check_in, a.check_out)) / 3600 AS total_hours_worked,
            ROUND(
                (SUM(TIMESTAMPDIFF(SECOND, a.check_in, a.check_out)) / 3600) 
                / 120 * (es.fixed_salary / 2), 2
            ) AS calculated_salary  -- Assuming bi-monthly salary division
        FROM 
            employees e
        JOIN 
            employee_salary es ON e.id = es.employee_id
        JOIN 
            attendance a ON e.id = a.employee_id
        WHERE 
            a.status = 'Present' 
            AND a.check_in BETWEEN ? AND ?  -- Use parameters to pass date range dynamically
        GROUP BY 
            e.id, e.full_name, es.fixed_salary;
        `;

        db.query(query, [startDate, endDate], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json(results)
        });

} 

const getPresentEmployee = (req, res) => {
    const { date } = req.body;

    // Basic validation for date format (assuming 'YYYY-MM-DD')
    if (!date || !/\d{4}-\d{2}-\d{2}/.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Please use 'YYYY-MM-DD'." });
    }

    const query = `
        SELECT 
            e.id AS employee_id,
            e.full_name,
            e.email,
            a.check_in,
            a.check_out,
            a.status AS attendance_status,
            TIMESTAMPDIFF(HOUR, a.check_in, a.check_out) AS hours_worked
        FROM 
            employees e
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

const getEmployeeAttendance = (req, res) => {
    const query = `        SELECT 
            e.id AS employee_id,
            e.full_name,
            e.email,
            a.check_in,
            a.check_out,
            a.status AS attendance_status,
            SEC_TO_TIME(TIMESTAMPDIFF(SECOND, check_in, check_out)) AS hours_worked
        FROM 
            employees e
        JOIN 
            attendance a ON e.id = a.employee_id
       `;
       
       db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results)
       });
}



module.exports = { getEmployeeSalary, getPresentEmployee, calculateEmployeeSalary, getEmployeeAttendance};