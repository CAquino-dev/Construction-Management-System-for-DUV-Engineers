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
            a.status AS attendance_status
        FROM 
            employees e
        JOIN 
            attendance a ON e.id = a.employee_id
        WHERE 
            a.status = 'Present' 
        AND DATE(a.check_in) = ?`;

    db.query(query, [date], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        // Check if no records found
        if (results.length === 0) {
            return res.status(404).json({ message: "No employees were present on the selected date." });
        }

        res.json(results);
    });
};


module.exports = { getEmployeeSalary, getPresentEmployee };