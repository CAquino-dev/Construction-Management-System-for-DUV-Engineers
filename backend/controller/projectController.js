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
          m.id,
          m.project_id,
          m.timestamp,
          m.title,
          m.details,
          m.status,
          m.start_date,
          m.due_date,
          mi.item_name,
          mi.category,
          mi.quantity,
          mi.unit_cost,
          mi.total_cost,
          mi.estimated_cost,
          mi.actual_cost
    FROM milestones m
    LEFT JOIN milestone_items mi ON m.id = mi.milestone_id
    WHERE m.project_id = ?
    ORDER BY m.timestamp DESC, m.id, mi.item_name;


  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching milestones:", err);
      return res.status(500).json({ error: "Failed to fetch milestones" });
    }

    // Group by milestone id
    const milestonesMap = new Map();

    results.forEach(row => {
      const milestoneId = row.id;

      if (!milestonesMap.has(milestoneId)) {
        // Clone milestone-level data (excluding item fields)
        milestonesMap.set(milestoneId, {
          id: row.id,
          project_id: row.project_id,
          timestamp: row.timestamp,
          title: row.title,
          details: row.details,
          status: row.status,
          start_date: row.start_date,
          due_date: row.due_date,
          project_photo: row.project_photo,
          budget_amount: row.budget_amount,
          items: []
        });
      }

      // If milestone_items exist for this row, add them to items array
      if (row.item_name) {
        milestonesMap.get(milestoneId).items.push({
          item_name: row.item_name,
          category: row.category,
          quantity: row.quantity,
          unit_cost: row.unit_cost,
          total_cost: row.total_cost,
          estimated_cost: row.estimated_cost,
          actual_cost: row.actual_cost
        });
      }
    });

    // Convert map to array
    const milestones = Array.from(milestonesMap.values());

    res.json({ milestones });
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
    projectManagerId,
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
      [client_name, client_email, client_phone, client_address, hashPassword, null], 
      (err, clientResult) => {
        if (err) {
          console.error("Error inserting client:", err);
          return res.status(500).json({ error: "Failed to insert client" });
        }

        const clientId = clientResult.insertId;

        const insertProjectQuery = `
          INSERT INTO engineer_projects (
            client_id, engineer_id, project_manager_id, project_name, description, start_date, end_date,
            status, budget, cost_breakdown, location, payment_schedule,
            project_type, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        db.query(
          insertProjectQuery,
          [
            clientId,
            assigned_users.find(u => u.role_in_project === "engineer")?.user_id || null,
            projectManagerId,
            project_name,
            description,
            start_date,
            end_date,
            budget,
            cost_breakdown,
            location,
            payment_schedule,
            project_type
          ],
          (err, projectResult) => {
            if (err) {
              console.error("Error inserting project:", err);
              return res.status(500).json({ error: "Failed to insert project" });
            }

            const projectId = projectResult.insertId;

            if (!Array.isArray(assigned_users)) {
              return res.status(400).json({ error: "assigned_users must be an array" });
            }

            // ✅ Add PM to assignments automatically
            const assignments = [
              ...assigned_users.map((user) => [
                projectId,
                user.user_id,
                user.role_in_project,
                new Date()
              ]),
              [projectId, projectManagerId, "project_manager", new Date()]
            ];

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
                project_id: projectId
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

const createMilestone = (req, res) => {
    const { project_id, title, details, start_date, due_date, items } = req.body;

    if (!project_id || !title || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields or items' });
    }

    // Step 1: Insert milestone
    const milestoneQuery = `
        INSERT INTO milestones (project_id, title, details, start_date, due_date, status) 
        VALUES (?, ?, ?, ?, ?, 'Draft')
    `;

    db.query(milestoneQuery, [project_id, title, details, start_date, due_date], (err, milestoneResult) => {
        if (err) {
            console.error('Error inserting milestone:', err);
            return res.status(500).json({ error: 'Database error inserting milestone' });
        }

        const milestoneId = milestoneResult.insertId;

        // Step 2: Insert milestone items (no unit_cost yet)
        const itemQuery = `
            INSERT INTO milestone_items (milestone_id, item_name, category, quantity, unit_cost) 
            VALUES ?
        `;

        const itemValues = items.map(item => [
            milestoneId,
            item.item_name,
            item.category,
            item.quantity,
            null // unit_cost is NULL until project manager estimates it
        ]);

        db.query(itemQuery, [itemValues], (err2, itemResult) => {
            if (err2) {
                console.error('Error inserting milestone items:', err2);
                return res.status(500).json({ error: 'Database error inserting items' });
            }

            return res.status(201).json({
                message: 'Milestone created successfully. Items pending cost estimation by Project Manager.',
                milestone_id: milestoneId
            });
        });
    });
};




module.exports = { getEstimate, getMilestones, createExpense, 
  getExpenses, getPendingExpenses, updateEngineerApproval, 
  updateMilestoneStatus, createProjectWithClient, getContractById,

  createMilestone
};