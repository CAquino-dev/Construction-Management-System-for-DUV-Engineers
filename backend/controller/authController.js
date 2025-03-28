const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config();

const registerUser = async (req, res) => {
    const { username, email, fullname, password, role_id, department_id } = req.body;

    if (!username || !password) {
        return res.status(500).json({ error: "All fields are required" })
    }

    try {
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        console.log("hashed password:", hashPassword);

        const query = "INSERT INTO users (username, email, full_name, password_hash, role_id, department_id) values (?, ?, ?, ?, ?, ?)";
        db.query(query, [username, email, fullname, hashPassword, role_id, department_id], (err, results) => {
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

const adminLogin = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(500).json({ error: "All fields are required" })
    }

    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: "database error!" })

        if (results.length === 0) {
            return res.status(500).json({ error: "invalid username or password" })
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid Username or Password" })
        }

        // const permissionQuery = `
        //     SELECT DISTINCT p.permission_name 
        //     FROM users u
        //     LEFT JOIN roles r ON u.role_id = r.id
        //     LEFT JOIN role_permissions rp ON r.id = rp.role_id
        //     LEFT JOIN permissions p ON rp.permission_id = p.id
        //     LEFT JOIN user_permissions up ON u.id = up.user_id
        //     WHERE u.id = ?;
        // `;

        const permissionQuery = `
        SELECT p.permission_name 
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ? 

        UNION

        SELECT p.permission_name 
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ?;
        `;

        db.query(permissionQuery, [user.id, user.id], (err, results) => {
            if (err) return res.status(500).json({ error: "Failed to fetch permissions" });

            res.json({message: "Login Successful", results});
        })

    })

}

    // const adminLogin = (req, res) => {
    //     const { username, password } = req.body;
    
    //     if (!username || !password) {
    //         return res.status(400).json({ error: "All fields are required" });
    //     }
    
    //     const query = "SELECT * FROM users WHERE username = ? AND (role_id = 1 OR role_id = 2)";
    
    //     db.query(query, [username], async (err, results) => {
    //         if (err) {
    //             console.error(err);
    //             return res.status(500).json({ error: "Database error" });
    //         }
    
    //         if (results.length === 0) {
    //             return res.status(401).json({ error: "Invalid Username or Password" });
    //         }
    
    //         const user = results[0];
    
    //         // Check password
    //         const isMatch = await bcrypt.compare(password, user.password_hash);
    //         if (!isMatch) {
    //             return res.status(401).json({ error: "Invalid Username or Password" });
    //         }
    
    //         // Return login success and user role
    //         res.json({ 
    //             message: "Admin login successful", 
    //             user: { id: user.id, username: user.username, role_id: user.role_id } 
    //         });
    //     });
    // };

module.exports = { registerUser, adminLogin };