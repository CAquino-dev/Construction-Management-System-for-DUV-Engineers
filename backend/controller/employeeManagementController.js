const bcrypt = require("bcryptjs");
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
    hourly_rate,
    permissions // optional: array of { permission_key, value }
  } = req.body;

  // Check required fields
  if (!fullname || !gender || !contactNo || !age || !birthday || !address || !role_id ||
      !employmentStatus || !jobTitle || !dateHired || !emergencyName || !emergencyRelationship ||
      !emergencyContact || !email || !department_id || !password || !hourly_rate) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashPassword) => {
    if (err) return res.status(500).json({ error: "Error hashing password" });

    const currentYear = new Date().getFullYear();
    const yearPrefix = currentYear.toString();

    const query = `SELECT employee_id FROM users WHERE employee_id LIKE ? ORDER BY employee_id DESC LIMIT 1`;
    db.query(query, [`${yearPrefix}-%`], (err, result) => {
      if (err) return res.status(500).json({ error: "Error fetching last employee ID" });

      let newEmployeeNumber = "0001";
      if (result.length > 0) {
        const lastEmployeeID = result[0].employee_id;
        const lastNumber = parseInt(lastEmployeeID.split('-')[1], 10);
        newEmployeeNumber = (lastNumber + 1).toString().padStart(4, '0');
      }

      const newEmployeeID = `${yearPrefix}-${newEmployeeNumber}`;

      const insertQuery = `INSERT INTO users (
          employee_id, full_name, gender, age, birthday, address, 
          role_id, department_id, employment_status, job_title, date_hired, emergency_name, 
          emergency_relationship, emergency_contact, email, password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(insertQuery, [
        newEmployeeID,
        fullname,
        gender,
        age,
        birthday,
        address,
        role_id,
        department_id,
        employmentStatus,
        jobTitle,
        dateHired,
        emergencyName,
        emergencyRelationship,
        emergencyContact,
        email,
        hashPassword
      ], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const newUserId = results.insertId;

        // Insert hourly_rate
        const salaryInsertQuery = `INSERT INTO employee_salary (employee_id, hourly_rate) VALUES (?, ?)`;
        db.query(salaryInsertQuery, [newUserId, hourly_rate], (err) => {
          if (err) return res.status(500).json({ error: "Error inserting hourly rate" });

          // Assign permissions
          if (permissions && permissions.length > 0) {
            // Insert custom permissions from frontend
            const permQuery = `INSERT INTO user_permissions (user_id, permission_key, value) VALUES ?`;
            const permValues = permissions.map(p => [newUserId, p.permission_key, p.value]);
            db.query(permQuery, [permValues], (err) => {
              if (err) return res.status(500).json({ error: "Error inserting permissions" });
              return res.status(200).json({ message: "User registered successfully with custom permissions" });
            });
          } else {
            // No custom permissions → fetch role defaults from permissions table
            const rolePermQuery = `SELECT * FROM permissions WHERE id = ?`;
            db.query(rolePermQuery, [role_id], (err, roleRows) => {
              if (err) return res.status(500).json({ error: "Error fetching role defaults" });
              if (roleRows.length === 0) return res.status(500).json({ error: "Role not found" });

              const role = roleRows[0];
              const permKeys = Object.keys(role).filter(k => !["id", "role_name"].includes(k));
              const permValues = permKeys.map(k => [newUserId, k, role[k] || "N"]);

              const permInsertQuery = `INSERT INTO user_permissions (user_id, permission_key, value) VALUES ?`;
              db.query(permInsertQuery, [permValues], (err) => {
                if (err) return res.status(500).json({ error: "Error inserting default permissions" });
                return res.status(200).json({ message: "User registered successfully with role default permissions" });
              });
            });
          }
        });
      });
    });
  });
};


// const addEmployee = (req, res) => {
//   const {
//     fullname,
//     gender,
//     contactNo,
//     age,
//     birthday,
//     address,
//     role_id,
//     employmentStatus,
//     jobTitle,
//     dateHired,
//     emergencyName,
//     emergencyRelationship,
//     emergencyContact,
//     email,
//     department_id,
//     password,
//     hourly_rate,  // Added hourly_rate to the request body
//   } = req.body;

//   // Check if required fields are provided
//   if (!fullname || !gender || !contactNo || !age || !birthday || !address || !role_id || !employmentStatus || !jobTitle || !dateHired || !emergencyName || !emergencyRelationship || !emergencyContact || !email || !department_id || !password || !hourly_rate) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   // Hash the password
//   const saltRounds = 10;
//   bcrypt.hash(password, saltRounds, (err, hashPassword) => {
//     if (err) {
//       return res.status(500).json({ error: "Error hashing password" });
//     }

//     // Step 1: Generate the employee ID
//     const currentYear = new Date().getFullYear(); // Get current year
//     const yearPrefix = currentYear.toString();  // Year part (e.g., '2025')

//     // Query to get the highest employee ID for the current year
//     const query = `SELECT employee_id FROM users WHERE employee_id LIKE ? ORDER BY employee_id DESC LIMIT 1`;
//     db.query(query, [`${yearPrefix}-%`], (err, result) => {
//       if (err) {
//         return res.status(500).json({ error: "Error fetching last employee ID" });
//       }

//       let newEmployeeNumber = "0001";  // Default number if no employees exist for the year

//       if (result.length > 0) {
//         // Get the last employee number and increment it by 1
//         const lastEmployeeID = result[0].employee_id;
//         const lastNumber = parseInt(lastEmployeeID.split('-')[1], 10); // Extract the last number
//         newEmployeeNumber = (lastNumber + 1).toString().padStart(4, '0');  // Increment the number and pad to 4 digits
//       }

//       // Generate the new employee ID (e.g., "2025-0001")
//       const newEmployeeID = `${yearPrefix}-${newEmployeeNumber}`;

//       // Step 2: Insert the employee data with the generated employee_id
//       const insertQuery = `INSERT INTO users (
//           employee_id, full_name, gender, age, birthday, address, 
//           role_id, department_id, employment_status, job_title, date_hired, emergency_name, 
//           emergency_relationship, emergency_contact, email, password
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//       db.query(insertQuery, [
//         newEmployeeID,        // Generated employee ID
//         fullname,             // Full name
//         gender,               // Gender
//         age,                  // Age
//         birthday,             // Birthday
//         address,              // Address
//         role_id,              // Role ID
//         department_id,        // Department ID
//         employmentStatus,     // Employment status
//         jobTitle,             // Job title
//         dateHired,            // Date hired
//         emergencyName,        // Emergency contact name
//         emergencyRelationship, // Emergency relationship
//         emergencyContact,     // Emergency contact number
//         email,                // Employee's email
//         hashPassword,         // Hashed password
//       ], (err, results) => {
//         if (err) {
//           console.log("Error details:", err); // For debugging purposes
//           return res.status(500).json({ error: err.message });
//         }

//         // Step 3: Retrieve the ID of the newly inserted employee
//         const newEmployeeIDFromDB = results.insertId;  // Get the actual ID from the users table

//         // Step 4: Insert the hourly_rate into employee_salary table using the user ID
//         const salaryInsertQuery = `INSERT INTO employee_salary (employee_id, hourly_rate) VALUES (?, ?)`;

//         db.query(salaryInsertQuery, [newEmployeeIDFromDB, hourly_rate], (err, result) => {
//           if (err) {
//             console.log("Error details:", err);
//             return res.status(500).json({ error: "Error inserting hourly rate" });
//           }

//           res.status(200).json({ message: "User registered successfully" });
//         });
//       });
//     });
//   });
// };
  
const getPermissions = (req, res) => {
  // First: get roles
  const roleQuery = `SELECT id, role_name FROM permissions`;

  // Second: get column names of permissions table
  const columnQuery = `SHOW COLUMNS FROM permissions`;

  db.query(roleQuery, (err, roleResults) => {
    if (err) return res.status(500).json({ error: "Database error (roles)" });

    db.query(columnQuery, (err2, columnResults) => {
      if (err2) return res.status(500).json({ error: "Database error (columns)" });

      // Filter out metadata columns
      const permissionColumns = columnResults
        .map((col) => col.Field)
        .filter((f) => f !== "id" && f !== "role_name") // keep only permission flags
        .map((f) => ({
          key: f,
          label: f
            .replace(/^can_/, "") // remove "can_" prefix
            .replace(/_/g, " ") // replace underscores with spaces
            .replace(/\b\w/g, (c) => c.toUpperCase()), // capitalize words
        }));

      res.json({
        roles: roleResults, // [{ id, role_name }]
        permissions: permissionColumns, // [{ key, label }]
      });
    });
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

const attendanceStatus = (req, res) => {
  const { employeeId } = req.params;
  const today = new Date().toISOString().split("T")[0];

  const sql = `
    SELECT check_in, check_out 
    FROM attendance 
    WHERE employee_id = ? 
      AND DATE(check_in) = ?
    LIMIT 1
  `;

  db.query(sql, [employeeId, today], (err, results) => {
    if (err) {
      console.error("Error fetching attendance:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      const record = results[0];
      let elapsedSeconds = 0;
      let status = "Present";

      if (record.check_in) {
        const checkInTime = new Date(record.check_in);

        // Calculate elapsed time
        const checkOutTime = record.check_out ? new Date(record.check_out) : new Date();
        elapsedSeconds = Math.floor((checkOutTime - checkInTime) / 1000);

        // 🔥 Late if after 9:00 AM
        const lateThreshold = new Date(checkInTime);
        lateThreshold.setHours(9, 0, 0, 0);

        if (checkInTime > lateThreshold) {
          status = "Late";
        }
      }

      return res.json({
        checkedIn: !!record.check_in,
        checkedOut: !!record.check_out,
        checkInTime: record.check_in,
        checkOutTime: record.check_out,
        elapsedSeconds,
        status
      });
    }

    // 🔥 No attendance record for today
    const now = new Date();
    const cutoffHour = 18; // 6:00 PM cutoff

    if (now.getHours() >= cutoffHour) {
      // End of day and still no check-in → Absent
      return res.json({ checkedIn: false, checkedOut: false, status: "Absent" });
    }

    // Still during the day → Not Checked In yet
    return res.json({ checkedIn: false, checkedOut: false, status: "Not Checked In" });
  });
};

const getEmployeeInformation = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
    u.id,
    p.role_name AS position,
    u.username,
    u.email,
    u.full_name,
    u.created_at AS hire_date,
    d.name
    FROM users u
    JOIN permissions p ON p.id = u.role_id
    JOIN departments d ON d.id = u.department_id
    WHERE u.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching employee info:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(results[0]);
  });
};

const getEmployeeAttendance = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      work_date,
      status,
      check_in,
      check_out,
      CASE 
        WHEN check_in IS NOT NULL AND check_out IS NOT NULL 
        THEN ROUND(TIMESTAMPDIFF(SECOND, check_in, check_out) / 3600, 2)
        ELSE 0
      END AS hours_worked
    FROM attendance
    WHERE employee_id = ?
    ORDER BY work_date DESC
    LIMIT 30
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching attendance:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};


const getEmployeeSalary = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
        e.id AS employee_id,
        e.full_name,
        p.period_start,
        p.period_end,
        p.total_hours_worked,
        p.calculated_salary,
        pi.finance_status, 
        pi.hr_status,
        pi.payment_status AS status,        -- Released / Paid
        pi.signature_url, -- store signature file path here
        pi.paid_by,
        pi.paid_at,
        p.overtime_pay,
        p.philhealth_deduction,
        p.sss_deduction,
        p.pagibig_deduction,
        p.total_deductions,
        p.final_salary,
        d.name AS department_name,
        es.hourly_rate,
        pi.remarks
    FROM payroll p
    JOIN users e 
        ON p.employee_id = e.id
    JOIN departments d 
        ON e.department_id = d.id
    JOIN employee_salary es 
        ON e.id = es.employee_id
    JOIN payslip_items pi 
        ON pi.payroll_id = p.id
    WHERE e.id = ?
    ORDER BY p.period_start DESC
    LIMIT 10;
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching salary:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

module.exports = { addEmployee, checkIn, checkOut, 
  getPermissions, getDepartments, attendanceStatus,
  getEmployeeInformation, getEmployeeAttendance, getEmployeeSalary
 };