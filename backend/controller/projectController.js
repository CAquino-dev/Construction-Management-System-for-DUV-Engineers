// controllers/projectController.js
const db = require('../config/db');  // Importing the MySQL connection
const bcrypt = require("bcrypt");

const calculateEstimate = async (data) => {
  const { projectType, materialType, sizeInSqm, location, budget } = data;  // Get projectType, materialType, area in sqm, location, and budget

  try {
    // Query to get the base cost from project_types based on the project type
    const [projectTypeRows] = await db.promise().query(
      'SELECT base_cost FROM project_types WHERE project_type = ?', [projectType]
    );

    // Query to get the cost factor from materials based on the material type
    const [materialRows] = await db.promise().query(
      'SELECT cost_factor FROM materials WHERE material_type = ?', [materialType]
    );

    // Query to get the cost factor from locations based on the selected location
    const [locationRows] = await db.promise().query(
      'SELECT cost_factor FROM locations WHERE location = ?', [location]
    );

    // Query to get the cost per square meter from the sizes table based on the project type
    const [sizeRows] = await db.promise().query(
      'SELECT cost_per_sqm FROM sizes WHERE project_type = ?', [projectType]
    );

    // If any of the rows are not found, return an error
    if (projectTypeRows.length === 0 || materialRows.length === 0 || locationRows.length === 0 || sizeRows.length === 0) {
      throw new Error('Invalid input data');
    }

    // Retrieve the individual cost factors and convert them to numbers
    const baseCost = parseFloat(projectTypeRows[0].base_cost);
    const materialCostFactor = parseFloat(materialRows[0].cost_factor);
    const locationCostFactor = parseFloat(locationRows[0].cost_factor);
    const sizeCostPerSqm = parseFloat(sizeRows[0].cost_per_sqm);

    // Calculate the total cost by multiplying area (sizeInSqm) with the cost per square meter for the project type
    const totalCost = (baseCost + materialCostFactor + locationCostFactor + sizeCostPerSqm) * sizeInSqm;

    // Check if the total cost exceeds the user's budget
    if (totalCost > budget) {
      return { totalCost, message: 'The estimated cost exceeds your budget.' };
    } else {
      return { totalCost, message: 'The estimated cost is within your budget.' };
    }

  } catch (error) {
    throw new Error(`Error calculating estimate: ${error.message}`);
  }
};

const getEstimate = async (req, res) => {
  const { projectType, materialType, sizeInSqm, location, budget } = req.body; // Include budget in the request
  try {
    // Call the calculateEstimate function and get the estimated cost
    const { totalCost, message } = await calculateEstimate({ projectType, materialType, sizeInSqm, location, budget });

    // Send the estimate and message as the response
    res.json({ totalCost, message });

  } catch (error) {
    // Handle any errors that occur during the estimate calculation
    res.status(500).json({ message: 'Error calculating estimate', error: error.message });
  }
};


// Get all milestones for a specific project
const getMilestones = (req, res) => {
  const { projectId } = req.params;

  const query = `
    SELECT
      id,
      project_id,
      timestamp,
      status,
      details,
      project_photo,
      progress_status,
      payment_amount,
      budget_amount,
      due_date,
      start_date,
      completion_date,
      estimated_cost_pdf   -- <-- add this field
    FROM milestones
    WHERE project_id = ?
    ORDER BY timestamp DESC
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching milestones:", err);
      return res.status(500).json({ error: "Failed to fetch milestones" });
    }

    // Optional: Convert relative path to full URL for frontend use
    const host = req.get('host'); // e.g. 'localhost:5000'
    const protocol = req.protocol; // 'http' or 'https'

    const updatedResults = results.map(milestone => {
      if (milestone.estimated_cost_pdf) {
        milestone.estimated_cost_pdf = `${protocol}://${host}${milestone.estimated_cost_pdf}`;
      }
      return milestone;
    });

    res.json({ milestones: updatedResults });
  });
};


const createExpense = (req, res) => {
  const {
    milestone_id,
    expense_type, // 'Labor' or 'Supply'
    date,         // For supply expense
    date_from,    // For labor expense
    date_to,      // For labor expense
    title,
    quantity,     // For supply expense
    unit,         // For supply expense
    price_per_qty,// For supply expense
    amount,
    status,       // Optional, default to 'Requested'
    remarks
  } = req.body;

  // Basic validation (add more as needed)
  if (!milestone_id || !expense_type || !title || !amount) {
    return res.status(400).json({ error: 'milestone_id, expense_type, title, and amount are required' });
  }

  const insertQuery = `
INSERT INTO expenses
  (milestone_id, expense_type, date, date_from, date_to, description, quantity, unit, price_per_qty, amount, status, created_at, updated_at, remarks)
VALUES
  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
  `;

  db.query(
    insertQuery,
    [
      milestone_id,
      expense_type,
      date || null,
      date_from || null,
      date_to || null,
      title,
      quantity || null,
      unit || null,
      price_per_qty || null,
      amount,
      status || 'Requested',
      remarks || null
    ],
    (err, result) => {
      if (err) {
        console.error('Error creating expense:', err);
        return res.status(500).json({ error: 'Failed to create expense' });
      }
      res.status(201).json({ message: 'Expense created successfully', expenseId: result.insertId });
    }
  );
};

const getExpenses = (req, res) => {
  const { milestone_id, type } = req.query;

  if (!milestone_id) {
    return res.status(400).json({ error: "milestone_id query param is required" });
  }

  let query = `
    SELECT
      expense_id,
      milestone_id,
      expense_type,
      date,
      date_from,
      date_to,
      description,
      quantity,
      unit,
      price_per_qty,
      amount,
      status,
      approved_by,
      approval_date,
      paid_date,
      engineer_approval_status,
      finance_approval_status,
      remarks
    FROM expenses
    WHERE milestone_id = ?
      AND finance_approval_status = 'Approved'
  `;

  const params = [milestone_id];

  if (type) {
    query += ` AND expense_type = ?`;
    params.push(type);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
    res.json({ expenses: results });
  });
};


const getPendingExpenses = (req, res) => {
  const engineerApprovalStatus = 'Pending';

  const query = `
    SELECT
      expense_id,
      milestone_id,
      expense_type,
      date,
      date_from,
      date_to,
      description,
      quantity,
      unit,
      price_per_qty,
      amount,
      status,
      approved_by,
      approval_date,
      paid_date,
      engineer_approval_status,
      finance_approval_status,
      remarks
    FROM expenses
    WHERE engineer_approval_status = ?
    ORDER BY date DESC, expense_id DESC
  `;

  db.query(query, [engineerApprovalStatus], (err, results) => {
    if (err) {
      console.error('Error fetching pending expenses:', err);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
    res.json({ expenses: results });
  });
};

const updateEngineerApproval = (req, res) => {
  const { expenseId } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Approved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const query = `
    UPDATE expenses
    SET engineer_approval_status = ?, updated_at = NOW()
    WHERE expense_id = ?
  `;

  db.query(query, [status, expenseId], (err, result) => {
    if (err) {
      console.error('Error updating engineer approval:', err);
      return res.status(500).json({ error: 'Failed to update engineer approval' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Engineer approval status updated successfully' });
  });
};

const updateMilestoneStatus = (req, res) => {
  const milestoneId = req.params.id;
  const { newStatus } = req.body;

  const validStatuses = ['For Payment', 'Payment Confirmed', 'In Progress', 'Completed', 'Cancelled'];

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const query = `
    UPDATE milestones
    SET progress_status = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(query, [newStatus, milestoneId], (err, result) => {
    if (err) {
      console.error('Error updating milestone status:', err);
      return res.status(500).json({ error: 'Failed to update milestone status' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json({ message: `Milestone status updated to ${newStatus}` });
  });
};

const createProjectWithClient = (req, res) => {
  const {
    client_name,
    client_email,
    client_phone,
    client_address,
    project_name,
    description,
    start_date,
    end_date,
    budget,
    cost_breakdown,
    location,
    payment_schedule,
    project_type,
    assigned_users // array of { user_id, role_in_project }
  } = req.body;

  // Hash a default password for client
  const defaultPassword = "client123"; // Change this logic later
  const saltRounds = 10;

  bcrypt.hash(defaultPassword, saltRounds, (err, hashPassword) => {
    if (err) return res.status(500).json({ error: "Error hashing password" });

    const insertClientQuery = `
      INSERT INTO users (full_name, email, phone, address, password, role_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW())
    `;

    db.query(
      insertClientQuery,
      [client_name, client_email, client_phone, client_address, hashPassword, null], // role_id 5 = Client
      (err, clientResult) => {
        if (err) {
          console.error("Error inserting client:", err);
          return res.status(500).json({ error: "Failed to insert client" });
        }

        const clientId = clientResult.insertId;

        const insertProjectQuery = `
          INSERT INTO engineer_projects (
            client_id, engineer_id, project_name, description, start_date, end_date,
            status, budget, cost_breakdown, location, payment_schedule,
            project_type, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        db.query(
          insertProjectQuery,
          [
          clientId,
          assigned_users.find(u => u.role_in_project === "engineer")?.user_id,
          project_name,
          description,
          start_date,
          end_date,
          budget,
          cost_breakdown,
          location,
          payment_schedule,
          project_type,
          ],
          (err, projectResult) => {
            if (err) {
              console.error("Error inserting project:", err);
              return res.status(500).json({ error: "Failed to insert project" });
            }

            const projectId = projectResult.insertId;

            // Insert project assignments
            if (!Array.isArray(assigned_users)) {
              return res.status(400).json({ error: "assigned_users must be an array" });
            }

            const assignments = assigned_users.map((user) => [
              projectId,
              user.user_id,
              user.role_in_project,
              new Date()
            ]);

            const assignmentQuery = `
              INSERT INTO project_assignments (project_id, user_id, role_in_project, assigned_at)
              VALUES ?
            `;

            db.query(assignmentQuery, [assignments], (err) => {
              if (err) {
                console.error("Error inserting project assignments:", err);
                return res.status(500).json({ error: "Failed to assign users" });
              }

              return res.status(200).json({
                message: "Project and client created successfully",
                project_id: projectId,
              });
            });
          }
        );
      }
    );
  });
};

const getContractById = (req, res) => {
  const contractId = req.params.contractId;

  const query = `
    SELECT 
      c.*, 
      p.title AS proposal_title, 
      p.budget_estimate, 
      p.timeline_estimate,
      l.client_name AS client_name,
      l.email AS client_email,
      l.phone_number AS client_phone
    FROM contracts c
    JOIN proposals p ON c.proposal_id = p.id
    JOIN leads l ON p.lead_id = l.id
    WHERE c.id = ?
  `;

  db.query(query, [contractId], (err, results) => {
    if (err) {
      console.error("Error fetching contract:", err);
      return res.status(500).json({ error: "Failed to fetch contract details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json(results[0]);
  });
};




module.exports = { getEstimate, getMilestones, createExpense, 
  getExpenses, getPendingExpenses, updateEngineerApproval, 
  updateMilestoneStatus, createProjectWithClient, getContractById
};