const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config();


const setStatusInactive = (req, res) => {
    const query = '';
}
//working

const addEmployee = (req, res) => {
  const {
    fullname,
    gender,
    contactNo,
    age,
    birthday,
    address,
    role_id,
    employmentStatus,
    jobTitle,
    dateHired,
    emergencyName,
    emergencyRelationship,
    emergencyContact,
    email,
    department_id,
    password,
    hourly_rate,  // Added hourly_rate to the request body
  } = req.body;

  // Check if required fields are provided
  if (!fullname || !gender || !contactNo || !age || !birthday || !address || !role_id || !employmentStatus || !jobTitle || !dateHired || !emergencyName || !emergencyRelationship || !emergencyContact || !email || !department_id || !password || !hourly_rate) {
    return res.status(400).json({ error: "All fields are required" });
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
      const insertQuery = `INSERT INTO users (
          employee_id, full_name, gender, age, birthday, address, 
          role_id, department_id, employment_status, job_title, date_hired, emergency_name, 
          emergency_relationship, emergency_contact, email, password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(insertQuery, [
        newEmployeeID,        // Generated employee ID
        fullname,             // Full name
        gender,               // Gender
        age,                  // Age
        birthday,             // Birthday
        address,              // Address
        role_id,              // Role ID
        department_id,        // Department ID
        employmentStatus,     // Employment status
        jobTitle,             // Job title
        dateHired,            // Date hired
        emergencyName,        // Emergency contact name
        emergencyRelationship, // Emergency relationship
        emergencyContact,     // Emergency contact number
        email,                // Employee's email
        hashPassword,         // Hashed password
      ], (err, results) => {
        if (err) {
          console.log("Error details:", err); // For debugging purposes
          return res.status(500).json({ error: err.message });
        }

        // Step 3: Retrieve the ID of the newly inserted employee
        const newEmployeeIDFromDB = results.insertId;  // Get the actual ID from the users table

        // Step 4: Insert the hourly_rate into employee_salary table using the user ID
        const salaryInsertQuery = `INSERT INTO employee_salary (employee_id, hourly_rate) VALUES (?, ?)`;

        db.query(salaryInsertQuery, [newEmployeeIDFromDB, hourly_rate], (err, result) => {
          if (err) {
            console.log("Error details:", err);
            return res.status(500).json({ error: "Error inserting hourly rate" });
          }

          res.status(200).json({ message: "User registered successfully" });
        });
      });
    });
  });
};




  
  const getPermissions = (req, res) => {
    const query = `SELECT id, role_name from permissions`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results)
    });
  };

  const getDepartments = (req, res) => {
    const query = `SELECT id, name from departments`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results)
    });
  };

  const checkIn = (req, res) => {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }
  
    // Check if the employee is already checked in
    const checkQuery = `
      SELECT * FROM attendance
      WHERE employee_id = ? AND check_out IS NULL
      ORDER BY created_at DESC LIMIT 1;
    `;
  
    db.query(checkQuery, [employeeId], (err, results) => {
      if (err) {
        console.error("Error checking attendance:", err);
        return res.status(500).json({ error: "Failed to check attendance status" });
      }
  
      if (results.length > 0) {
        return res.status(400).json({ error: "Employee is already checked in" });
      }
  
      // If employee hasn't checked in, handle check-in
      const insertQuery = `
        INSERT INTO attendance (employee_id, check_in, status, work_date)
        VALUES (?, NOW(), 'Present', CURDATE())
      `;
  
      db.query(insertQuery, [employeeId], (err, result) => {
        if (err) {
          console.error("Error inserting check-in:", err);
          return res.status(500).json({ error: "Failed to check-in" });
        }
  
        res.status(201).json({
          message: "Check-in successful",
          check_in: new Date(),
          status: 'Present',
        });
      });
    });
  };

  const checkOut = (req, res) => {
    const { employeeId } = req.body;
  
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }
  
    // Check if the employee has already checked in (check-out is null)
    const checkQuery = `
      SELECT * FROM attendance
      WHERE employee_id = ? AND check_out IS NULL
      ORDER BY created_at DESC LIMIT 1;
    `;
  
    db.query(checkQuery, [employeeId], (err, results) => {
      if (err) {
        console.error("Error checking attendance:", err);
        return res.status(500).json({ error: "Failed to check attendance status" });
      }
  
      if (results.length === 0) {
        return res.status(400).json({ error: "Employee has not checked in yet" });
      }
  
      // If employee is checked in, update check-out time
      const updateQuery = `
        UPDATE attendance
        SET check_out = NOW(), status = 'Present'
        WHERE employee_id = ? AND check_out IS NULL
      `;
  
      db.query(updateQuery, [employeeId], (err, result) => {
        if (err) {
          console.error("Error updating check-out:", err);
          return res.status(500).json({ error: "Failed to check-out" });
        }
  
        res.status(200).json({
          message: "Check-out successful",
          check_out: new Date(),
          status: 'Present',
        });
      });
    });
  };

module.exports = { addEmployee, checkIn, checkOut, getPermissions, getDepartments };