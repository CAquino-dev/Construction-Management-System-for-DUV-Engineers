const db = require("../config/db");

const getEmployees = (req, res) => {
    const query =  `SELECT 
    employees.id, 
    employees.username, 
    employees.full_name, 
    employees.profile_picture, 
    employees.role_id, 
    employees.email,
    employees.status,
    departments.name AS department_name
    FROM employees
    LEFT JOIN departments ON employees.department_id = departments.id;
`
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results)
    });
};

const getEmployeesByDepartment = (req, res) => {
    const { department_id } = req.params;

    if (!department_id) {
        return res.status(400).json({ error: "Department ID is required" });
    }

    const query = `SELECT * FROM employees WHERE department_id = ?;`;

    db.query(query, [department_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json(results);
    });
}

module.exports = { getEmployees, getEmployeesByDepartment };