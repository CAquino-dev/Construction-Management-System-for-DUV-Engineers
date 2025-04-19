const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config();

//working
const registerUser = async (req, res) => {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !phone || !address || !password) {
        return res.status(500).json({ error: "All fields are required" })
    }

    try {
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        console.log("hashed password:", hashPassword);

        const query = "INSERT INTO users (full_name, email, phone, address, password ) values (?, ?, ?, ?, ? )";
        db.query(query, [name, email, phone, address, hashPassword ], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            } else {
                res.status(200).json({ meesage: "user registered successfully" })
            }
        })

    } catch (error) {
        return res.status(500).json({ error: "error hashing password" })
    }
}
//working
const Login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error!" });

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // If the user has no role_id (i.e., a client), return without permissions
        if (!user.role_id) {
            return res.json({
                message: "Login successful",
                userId: user.id,
                userType: "Client",
                permissions: null
            });
        }

        // Otherwise fetch permissions for employee
        const permissionQuery = `
            SELECT * FROM permissions WHERE id = ?;
        `;

        db.query(permissionQuery, [user.role_id], (err, results) => {
            if (err) return res.status(500).json({ error: "Failed to fetch permissions" });

            const permissionData = results[0];
            delete permissionData.id;
            delete permissionData.role_name;

            res.json({
                message: "Login successful",
                userId: user.id,
                userType: "Employee",
                permissions: permissionData
            });
        });
    });
};


module.exports = { registerUser, Login };