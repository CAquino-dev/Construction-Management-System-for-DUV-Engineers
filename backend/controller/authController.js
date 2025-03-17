const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config();

const registerUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(500).json({ error: "All fields are required" })
    }

    try {
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        console.log("hashed password:", hashPassword);

        const query = "INSERT INTO users (username, password_hash, role_id) values (?, ?, ?)";
        db.query(query, [username, hashPassword, 3], (err, results) => {
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

const loginUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(500).json({ error: "All fields are required" })
    }

    const query = "SELECT * FROM users WHERE username = ? AND role_id = 3";
    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: "database error!" })

        if (results.length === 0) {
            return res.status(500).json({ error: "invalid username or password" })
        }

        const user = results[0];
        console.log(user.role_id);

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid Username or Password" })
        }

        res.status(200).json({ message: "Login Successful" })

    })

}

    const adminLogin = (req, res) => {
        const { username, password } = req.body;
    
        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
    
        // Allow both Super Admin (role_id = 1) and Admin (role_id = 2)
        const query = "SELECT * FROM users WHERE username = ? AND (role_id = 1 OR role_id = 2)";
    
        db.query(query, [username], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database error" });
            }
    
            if (results.length === 0) {
                return res.status(401).json({ error: "Invalid Username or Password" });
            }
    
            const user = results[0];
    
            // Check password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid Username or Password" });
            }
    
            // Return login success and user role
            res.json({ 
                message: "Admin login successful", 
                user: { id: user.id, username: user.username, role_id: user.role_id } 
            });
        });
    };

module.exports = { registerUser, loginUser, adminLogin };