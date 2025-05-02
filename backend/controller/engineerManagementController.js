const db = require("../config/db");

const getEngineers = (req, res) => {
    query = 'SELECT * FROM users WHERE department_id = 4'

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch engineer records" });
        res.json(results);
    })

}


module.exports = { getEngineers };