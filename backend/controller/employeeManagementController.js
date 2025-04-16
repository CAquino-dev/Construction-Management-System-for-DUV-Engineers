const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config();


const setStatusInactive = (req, res) => {
    const query = '';
}
//working
const addEmployee = async (req, res) => {
    const { username, email, fullname, password, role_id, department_id } = req.body;
    
        if (!username || !password) {
            return res.status(500).json({ error: "All fields are required" })
        }
    
        try {
            const saltRounds = 10;
            const hashPassword = await bcrypt.hash(password, saltRounds);
    
            console.log("hashed password:", hashPassword);
    
            const query = "INSERT INTO users (username, email, full_name, password, role_id, department_id) values (?, ?, ?, ?, ?, ?)";
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


module.exports = { addEmployee };