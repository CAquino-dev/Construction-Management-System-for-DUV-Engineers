const db = require("../config/db");

const getUsers = (req, res) => {
    const query = "SELECT * FROM users"
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results)
    });
};

module.exports = { getUsers };