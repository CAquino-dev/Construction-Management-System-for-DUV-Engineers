const db = require("../config/db");

const getUsers = (req, res) => {
    const query =  `SELECT 
    users.id, 
    users.username, 
    users.full_name, 
    users.profile_picture, 
    users.role_id, 
    users.email,
    users.status,
    departments.name AS department_name
    FROM users
    LEFT JOIN departments ON users.department_id = departments.id;
`
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results)
    });
};

const getUsersByDepartment = (req, res) => {
    const { department_id } = req.params;

    if (!department_id) {
        return res.status(400).json({ error: "Department ID is required" });
    }

    const query = `SELECT * FROM users WHERE department_id = ?;`;

    db.query(query, [department_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json(results);
    });
}

module.exports = { getUsers, getUsersByDepartment };