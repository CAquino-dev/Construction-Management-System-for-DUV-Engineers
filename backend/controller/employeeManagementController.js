const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config();


const setStatusInactive = (req, res) => {
    const query = '';
}
//working
const addEmployee = (req, res) => {
    const { username, email, fullname, password, role_id, department_id } = req.body;
  
    // Check if required fields are provided
    if (!username || !password) {
      return res.status(500).json({ error: "All fields are required" });
    }
  
    // Hash the password
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hashPassword) => {
      if (err) {
        return res.status(500).json({ error: "Error hashing password" });
      }
  
      // Step 1: Generate the employee ID
      const currentYear = new Date().getFullYear(); // Get current year
      const yearPrefix = currentYear.toString();  // Year part (e.g., '2025')
  
      // Query to get the highest employee ID for the current year
      const query = `SELECT employee_id FROM users WHERE employee_id LIKE ? ORDER BY employee_id DESC LIMIT 1`;
      db.query(query, [`${yearPrefix}-%`], (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Error fetching last employee ID" });
        }
  
        let newEmployeeNumber = "0001";  // Default number if no employees exist for the year
  
        if (result.length > 0) {
          // Get the last employee number and increment it by 1
          const lastEmployeeID = result[0].employee_id;
          const lastNumber = parseInt(lastEmployeeID.split('-')[1], 10); // Extract the last number
          newEmployeeNumber = (lastNumber + 1).toString().padStart(4, '0');  // Increment the number and pad to 4 digits
        }
  
        // Generate the new employee ID (e.g., "2025-0001")
        const newEmployeeID = `${yearPrefix}-${newEmployeeNumber}`;
  
        // Step 2: Insert the employee data with the generated employee_id
        const insertQuery = `INSERT INTO users (employee_id, username, email, full_name, password, role_id, department_id) values (?, ?, ?, ?, ?, ?, ?)`;
        db.query(insertQuery, [
          newEmployeeID,  // Generated employee ID
          username,
          email,
          fullname,
          hashPassword,
          role_id,
          department_id
        ], (err, results) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          } else {
            res.status(200).json({ meesage: "user registered successfully" })
        }

        });
      });
    });
  };
  



module.exports = { addEmployee };