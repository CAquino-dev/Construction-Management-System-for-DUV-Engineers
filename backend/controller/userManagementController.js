const db = require("../config/db");

const getEmployees = (req, res) => {
  const query = `
    SELECT
      users.id,
      users.username,
      users.email,
      users.full_name,
      users.gender,
      users.age,
      users.birthday,
      users.phone,
      users.address,
      users.company_name,
      users.profile_picture,
      users.role_id,
      users.department_id,
      departments.name AS department_name,
      users.employment_status,
      users.job_title,
      users.date_hired,
      users.working_hours,
      users.emergency_name,
      users.emergency_relationship,
      users.emergency_contact,
      users.status,
      users.created_at,
      users.employee_id
    FROM users
    LEFT JOIN departments ON users.department_id = departments.id
    WHERE users.role_id IS NOT NULL;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};


const getEmployeesByDepartment = (req, res) => {
    const { department_id } = req.params;

    if (!department_id) {
        return res.status(400).json({ error: "Department ID is required" });
    }

    const query = `SELECT * FROM employees WHERE department_id = ?;`;

    db.query(query, [department_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json(results);
    });
}

const getAllUsers = (req, res) => {
  const query = `
    SELECT 
      u.id, u.full_name, u.email, u.phone, u.address, u.role_id, p.role_name AS role
    FROM users u
    LEFT JOIN permissions p ON u.role_id = p.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
    res.status(200).json(results);
  });
};

module.exports = { getEmployees, getEmployeesByDepartment, getAllUsers  };