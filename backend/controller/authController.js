const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config();

const registerUser = async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(500).json({ error:  "All fields are required" })
    }

    try {
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        console.log("hashed password:", hashPassword);

        const query = "INSERT INTO users (username, password_hash, role_id) values (?, ?, ?)";
        db.query(query, [username, hashPassword, 1], (err, results) => {
            if(err){
                return res.status(500).json({ error: err.message })
            }else{
                res.status(200).json({ meesage: "user registered successfully" })
            }
        })

    } catch (error) {
        return res.status(500).json({ error: "error hashing password" })
    }

}

const loginUser = () => {

}


module.exports = { registerUser, loginUser };