// controllers/projectController.js
const db = require('../config/db');  // Importing the MySQL connection
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/reports')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext;
    cb(null, fileName);
  }
});

const uploadReportsPDF = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
}).single('report_file'); // Name should match frontend


const calculateEstimate = async (data) => {
  const {
    projectType,
    materialType,
    sizeInSqm,
    location,
    budget,
    designComplexity,
    numFloors,
    foundationType,
    roofType,
    laborQuality,
    timelineUrgency,
    includePlumbing,
    includeElectrical,
    includeHVAC,
    siteAccessibility,
  } = data;

  try {
    // ----------------------------
    // 1. BASE COST BASED ON IMAGE TIERS
    // ----------------------------
    const costTiers = {
      'BARE': 23000,
      'STANDARD': 32000,
      'LUXURY': 44000,
      'ICONIC': 65000
    };

    // Map user selections to cost tiers based on the image specifications
    const getCostTier = (materialType, designComplexity) => {
      // Based on the image: Concrete = Bare, Tiles = Standard/Luxury, Natural Stone = Iconic
      if (materialType === 'Concrete') return 'BARE';
      if (materialType === 'Steel') return 'STANDARD';
      if (materialType === 'Wood') return 'LUXURY';
      
      // Fallback based on complexity
      if (designComplexity === 'Simple') return 'BARE';
      if (designComplexity === 'Moderate') return 'STANDARD';
      if (designComplexity === 'Complex') return 'LUXURY';
      
      return 'STANDARD';
    };

    const costTier = getCostTier(materialType, designComplexity);
    const baseCost = costTiers[costTier];

    // ----------------------------
    // 2. COST FACTORS
    // ----------------------------
    const materialCostFactor = {
      Concrete: 1.0,
      Steel: 1.1,
      Wood: 1.2,
    }[materialType] || 1.0;

    const locationCostFactor = {
      Dasmarinas: 1.0,
      Tagaytay: 1.15,
      Silang: 1.08,
    }[location] || 1.0;

    const complexityFactor = {
      Simple: 0.9,
      Moderate: 1.0,
      Complex: 1.2,
    }[designComplexity] || 1.0;

    const foundationFactor = {
      Slab: 1.0,
      Footing: 1.15,
      Pile: 1.3,
    }[foundationType] || 1.0;

    const roofFactor = {
      Gable: 1.0,
      Flat: 1.1,
      Metal: 1.05,
    }[roofType] || 1.0;

    const laborFactor = {
      Standard: 1.0,
      Skilled: 1.15,
      Premium: 1.3,
    }[laborQuality] || 1.0;

    const timelineFactor = {
      Normal: 1.0,
      Rush: 1.2,
      "Very Urgent": 1.4,
    }[timelineUrgency] || 1.0;

    const accessibilityFactor = {
      Easy: 1.0,
      Moderate: 1.08,
      Difficult: 1.15,
    }[siteAccessibility] || 1.0;

    // ----------------------------
    // 3. ADDITIONAL UTILITIES (Based on image specifications)
    // ----------------------------
    let utilityBreakdown = {};
    let utilityCost = 0;

    // Plumbing & Electrical are typically included in base construction
    if (includePlumbing) {
      utilityBreakdown.plumbing = 1500 * sizeInSqm;
      utilityCost += utilityBreakdown.plumbing;
    }
    if (includeElectrical) {
      utilityBreakdown.electrical = 1800 * sizeInSqm;
      utilityCost += utilityBreakdown.electrical;
    }
    // HVAC is typically extra for luxury/iconic tiers
    if (includeHVAC) {
      utilityBreakdown.hvac = 2500 * sizeInSqm;
      utilityCost += utilityBreakdown.hvac;
    }

    // ----------------------------
    // 4. BASE CALCULATIONS
    // ----------------------------
    const area = sizeInSqm * numFloors;

    // Main structural cost based on image tiers
    const structuralCost = baseCost * area;
    
    // Finishing costs vary by tier (higher tiers include better finishes)
    const finishingMultiplier = {
      'BARE': 0.15,
      'STANDARD': 0.25,
      'LUXURY': 0.35,
      'ICONIC': 0.5
    }[costTier];
    
    const finishingCost = area * baseCost * finishingMultiplier;
    const foundationCost = area * baseCost * (foundationFactor - 1) * 0.1;
    const roofingCost = area * baseCost * (roofFactor - 1) * 0.08;
    const laborCost = area * baseCost * (laborFactor - 1) * 0.2;

    // ----------------------------
    // 5. SUMMATION WITH ADJUSTMENTS
    // ----------------------------
    let subtotal =
      structuralCost +
      finishingCost +
      foundationCost +
      roofingCost +
      laborCost +
      utilityCost;

    const adjustmentFactor =
      materialCostFactor *
      locationCostFactor *
      complexityFactor *
      timelineFactor *
      accessibilityFactor;

    const adjustedTotal = subtotal * adjustmentFactor;

    // ----------------------------
    // 6. FORMATTING
    // ----------------------------
    const formatPeso = (val) => "₱" + Math.round(val).toLocaleString("en-PH");

    // Breakdown summary
    const breakdown = {
      "Base Construction": structuralCost,
      "Finishing Works": finishingCost,
      "Foundation": foundationCost,
      "Roofing": roofingCost,
      "Labor": laborCost,
      "Utilities": utilityCost,
      "Location & Complexity Adjustments": adjustedTotal - subtotal,
    };

    const totalCost = adjustedTotal;
    const costPerSqm = totalCost / area;

    // ----------------------------
    // 7. MESSAGE COMPOSITION - REFERENCING THE IMAGE
    // ----------------------------
    let message = `
🏗️ **Construction Cost Estimate**
*Based on 2024 Philippine Construction Cost Standards*

📊 **Cost Tier Applied: ${costTier}**
📍 **Reference:** ACDC 2024 Construction Cost Chart
💵 **Base Rate:** ${formatPeso(costTiers[costTier])}/sqm

------------------------------------------
**Project Details:**
- **Type:** ${projectType}
- **Material:** ${materialType}
- **Complexity:** ${designComplexity}
- **Floors:** ${numFloors}
- **Foundation:** ${foundationType}
- **Roof:** ${roofType}
- **Labor:** ${laborQuality}
- **Timeline:** ${timelineUrgency}
- **Location:** ${location}

📐 **Total Floor Area:** ${area.toLocaleString()} sqm
💰 **Estimated Total Cost:** ${formatPeso(totalCost)}
📏 **Cost per sqm:** ${formatPeso(costPerSqm)}

### 💸 Detailed Cost Breakdown:
- Base Construction (${costTier} tier): ${formatPeso(structuralCost)}
- Finishing Works: ${formatPeso(finishingCost)}
- Foundation System: ${formatPeso(foundationCost)}
- Roofing Structure: ${formatPeso(roofingCost)}
- Labor Costs: ${formatPeso(laborCost)}
- Utility Systems: ${formatPeso(utilityCost)}
- Location & Complexity Adjustments: ${formatPeso(breakdown["Location & Complexity Adjustments"])}

---

**📈 Applied Adjustment Factors:**
- Material (${materialType}): ${materialCostFactor}x
- Location (${location}): ${locationCostFactor}x
- Design Complexity: ${complexityFactor}x
- Timeline: ${timelineFactor}x
- Site Accessibility: ${accessibilityFactor}x
- **Total Multiplier:** ${adjustmentFactor.toFixed(2)}x

`;

    // Budget comparison
    if (totalCost > budget) {
      const shortfall = totalCost - budget;
      message += `⚠️ **Budget Alert:** The estimated cost exceeds your budget of ${formatPeso(budget)} by ${formatPeso(shortfall)}.`;
      message += `\n💡 **Suggestions:** Consider a ${getLowerTier(costTier)} finish, reduce area, or adjust specifications.`;
    } else {
      const surplus = budget - totalCost;
      message += `✅ **Budget Status:** Your budget of ${formatPeso(budget)} is sufficient with ${formatPeso(surplus)} remaining.`;
      message += `\n💡 **Opportunity:** You could upgrade to ${getHigherTier(costTier)} or add features.`;
    }

    // Reference to the image and disclaimers
    message += `\n\n---
**📋 Important Notes:**
*This estimate is based on the ACDC 2024 Construction Cost Chart for Philippine residential construction.*
*Rates are rules of thumb only and serve as a starting point for preliminary budgeting.*
*Consult a licensed contractor for detailed costing based on your specific requirements.*

**Factors that may impact final costs:**
• Soil conditions & site preparation
• Market fluctuations in material prices
• Labor availability & skill levels
• Design modifications & customizations
• Permit fees & regulatory requirements

*Ultra luxury houses can exceed beyond the costs included in the reference chart.*`;

    return { 
      totalCost: Math.round(totalCost), 
      breakdown, 
      message,
      costTier,
      baseCostPerSqm: costTiers[costTier],
      reference: "ACDC 2024 Construction Cost Chart"
    };
  } catch (error) {
    throw new Error(`Error calculating estimate: ${error.message}`);
  }
};

// Helper functions for tier suggestions
function getLowerTier(currentTier) {
  const tiers = ['BARE', 'STANDARD', 'LUXURY', 'ICONIC'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex > 0 ? tiers[currentIndex - 1] : 'BARE';
}

function getHigherTier(currentTier) {
  const tiers = ['BARE', 'STANDARD', 'LUXURY', 'ICONIC'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : 'ICONIC';
}



// API Endpoint
const getEstimate = async (req, res) => {
  try {
    const { totalCost, message } = await calculateEstimate(req.body);
    res.json({ totalCost, message });
  } catch (error) {
    res.status(500).json({ message: "Error calculating estimate", error: error.message });
  }
};


// Get all milestones for a specific project
const getMilestones = (req, res) => {
  const { projectId } = req.params;

  const query = `
    SELECT
      m.id AS milestone_id,
      m.project_id,
      m.timestamp,
      m.title,
      m.details,
      m.status,
      m.start_date,
      m.due_date,
      m.finance_rejection_stage,
      m.finance_remarks,

      mb.id AS milestone_boq_id,
      b.id AS boq_id,
      b.item_no,
      b.description AS boq_description,
      b.unit AS boq_unit,
      b.quantity AS boq_quantity,
      b.unit_cost AS boq_unit_cost,
      b.total_cost AS boq_total_cost,

      -- MTO
      mm.id AS mto_id,
      mm.description AS mto_description,
      mm.unit AS mto_unit,
      mm.quantity AS mto_quantity,
      mm.unit_cost AS mto_unit_cost,
      mm.total_cost AS mto_total_cost,

      -- LTO
      ml.id AS lto_id,
      ml.description AS lto_description,
      ml.allocated_budget AS lto_total_cost,
      ml.remarks AS lto_remarks,

      -- ETO
      me.id AS eto_id,
      me.equipment_name AS eto_equipment_name,
      me.days AS eto_days,
      me.daily_rate AS eto_daily_rate,
      me.total_cost AS eto_total_cost,

      -- milestone progress
      (SELECT COUNT(*) FROM milestone_tasks t WHERE t.milestone_id = m.id) AS total_tasks,
      (SELECT COUNT(*) FROM milestone_tasks t WHERE t.milestone_id = m.id AND t.status = 'Completed') AS completed_tasks

    FROM milestones m
    LEFT JOIN milestone_boq mb ON m.id = mb.milestone_id
    LEFT JOIN boq b ON mb.boq_id = b.id
    LEFT JOIN milestone_mto mm ON mb.id = mm.milestone_boq_id
    LEFT JOIN milestone_lto ml ON mb.id = ml.milestone_boq_id
    LEFT JOIN milestone_eto me ON mb.id = me.milestone_boq_id
    WHERE m.project_id = ?
    ORDER BY m.timestamp DESC, m.id, mb.id, mm.id
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching milestones:", err);
      return res.status(500).json({ error: "Failed to fetch milestones" });
    }

    const milestonesMap = new Map();

    results.forEach((row) => {
      if (!milestonesMap.has(row.milestone_id)) {
        // Calculate milestone progress
        let progress = 0;
        if (row.total_tasks > 0) {
          progress = Math.round((row.completed_tasks / row.total_tasks) * 100);
        }

        milestonesMap.set(row.milestone_id, {
          id: row.milestone_id,
          project_id: row.project_id,
          timestamp: row.timestamp,
          title: row.title,
          details: row.details,
          status: row.status,
          start_date: row.start_date,
          due_date: row.due_date,
          progress,
          finance_rejection_stage: row.finance_rejection_stage,
          finance_remarks: row.finance_remarks,
          boq_items: [],
        });
      }

      const milestone = milestonesMap.get(row.milestone_id);

      if (row.milestone_boq_id) {
        let boqItem = milestone.boq_items.find(
          (b) => b.milestone_boq_id === row.milestone_boq_id
        );

        if (!boqItem) {
          boqItem = {
            milestone_boq_id: row.milestone_boq_id,
            boq_id: row.boq_id,
            item_no: row.item_no,
            description: row.boq_description,
            unit: row.boq_unit,
            quantity: row.boq_quantity,
            unit_cost: row.boq_unit_cost,
            total_cost: row.boq_total_cost,
            mto_items: [],
            lto: null,
            eto: null,
          };
          milestone.boq_items.push(boqItem);
        }

        // MTO
        if (row.mto_id) {
          boqItem.mto_items.push({
            mto_id: row.mto_id,
            description: row.mto_description,
            unit: row.mto_unit,
            quantity: row.mto_quantity,
            unit_cost: row.mto_unit_cost,
            total_cost: row.mto_total_cost,
          });
        }

        // LTO
        if (row.lto_id) {
          boqItem.lto = {
            lto_id: row.lto_id,
            description: row.lto_description,
            total_cost: row.lto_total_cost,
            remarks: row.lto_remarks,
          };
        }

        // ETO
        if (row.eto_id) {
          boqItem.eto = {
            eto_id: row.eto_id,
            equipment_name: row.eto_equipment_name,
            days: row.eto_days,
            daily_rate: row.eto_daily_rate,
            total_cost: row.eto_total_cost,
          };
        }
      }
    });

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
    assigned_users, // array of { user_id, role_in_project }
    boq_items,      // array of { item_name, description, unit, quantity, unit_price }
    contractId      // ✅ new
  } = req.body;

  const defaultPassword = "client123"; 
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
            project_type, contract_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
            project_type,
            contractId || null // ✅ added here
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

            // ✅ Insert assignments
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

              // ✅ Insert BOQ items if provided
              if (Array.isArray(boq_items) && boq_items.length > 0) {
                console.log("📦 Received BOQ Items:", boq_items);

                const boqValues = boq_items.map(item => [
                  projectId,
                  item.item_no,
                  item.description || null,
                  item.unit,
                  item.quantity,
                  item.unit_cost,
                  item.quantity * item.unit_cost,
                  new Date()
                ]);

                const boqQuery = `
                  INSERT INTO boq (project_id, item_no, description, unit, quantity, unit_cost, total_cost, created_at)
                  VALUES ?
                `;

                db.query(boqQuery, [boqValues], (err) => {
                  if (err) {
                    console.error("Error inserting BOQ items:", err);
                    return res.status(500).json({ error: "Failed to insert BOQ items" });
                  }

                  return res.status(200).json({
                    message: "Project, client, and BOQ created successfully",
                    project_id: projectId,
                    contract_id: contractId || null
                  });
                });
              } else {
                return res.status(200).json({
                  message: "Project and client created successfully (no BOQ provided)",
                  project_id: projectId,
                  contract_id: contractId || null
                });
              }
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
      p.start_date AS proposal_start_date,
      p.end_date AS proposal_end_date,
      l.client_name AS client_name,
      l.email AS client_email,
      l.phone_number AS client_phone,
      l.site_location,
      l.site_visit_notes AS notes
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

const getBoqByProject = (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  const query = `
    SELECT *
    FROM boq
    WHERE project_id = ?
    ORDER BY id ASC
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching BOQ items:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.status(200).json(results);
  });
};

const getTasks = (req, res) => {
  const { milestoneId } = req.params;

  const milestoneQuery = "SELECT * FROM milestones WHERE id = ?";
  const tasksQuery = "SELECT * FROM milestone_tasks WHERE milestone_id = ?";
  
  db.query(milestoneQuery, [milestoneId], (err, milestoneResult) => {
    if (err) return res.status(500).json({ error: "Server error" });

    if (milestoneResult.length === 0) {
    return res.status(404).json({ error: "Milestone not found" });
    }

    db.query(tasksQuery, [milestoneId], (err, tasksResult) => {
      if (err) return res.status(500).json({ error: "Server error" });

      res.json({
        milestone: milestoneResult[0],
        tasks: tasksResult,
      })
    })
  })
}

const addTask = (req, res) => {
  const { milestoneId } = req.params;
  const { 
    title, 
    details, 
    start_date, 
    due_date, 
    status = "Pending", 
    priority
  } = req.body;

  if (!priority) {
    return res.status(400).json({ error: "Priority is required (Low, Medium, High)" });
  }

  // Step 1: Find the project and its foreman
  const foremanQuery = `
    SELECT pa.user_id AS foreman_id
    FROM milestones m
    JOIN project_assignments pa ON m.project_id = pa.project_id
    WHERE m.id = ? AND pa.role_in_project = 'Foreman'
    LIMIT 1
  `;

  db.query(foremanQuery, [milestoneId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch foreman" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "No foreman assigned to this project" });
    }

    const foremanId = result[0].foreman_id;

    // Step 2: Insert the new task assigned to the foreman
    const insertQuery = `
      INSERT INTO milestone_tasks 
      (milestone_id, title, details, start_date, due_date, status, priority, assigned_to) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [milestoneId, title, details, start_date, due_date, status, priority, foremanId],
      (err, insertResult) => {
        if (err) {
          return res.status(500).json({ error: "Failed to add task" });
        }

        res.json({
          id: insertResult.insertId,
          milestone_id: milestoneId,
          title,
          details,
          start_date,
          due_date,
          status,
          priority,
          assigned_to: foremanId,
        });
      }
    );
  });
};


// Update a task
const updateTask = (req, res) => {
  const { taskId } = req.params; // coming from /api/project/updateTask/:taskId
  const { title, details, start_date, due_date, priority, status } = req.body;

  const query = `
    UPDATE milestone_tasks
    SET title = ?, details = ?, start_date = ?, due_date = ?, priority = ?, status = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [title, details, start_date, due_date, priority, status, taskId],
    (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ error: "Failed to update task" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json({
        message: "Task updated successfully",
        task: {
          id: taskId,
          title,
          details,
          start_date,
          due_date,
          priority,
          status,
        },
      });
    }
  );
};

const deleteTask = (req, res) => {
  const { taskId } = req.params;

  const query = "DELETE FROM milestone_tasks WHERE id = ?";

  db.query(query, [taskId], (err, result) => {
    if (err) {
      console.error("Error deleting task:", err);
      return res.status(500).json({ error: "Failed to delete task" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

     res.json({ message: "Task deleted successfully", taskId });
  })
}

const getReports = (req, res) => {
  const { projectId } = req.params;

  const query = 'SELECT * FROM reports WHERE project_id = ?';

  db.query(query, [projectId], (err, results) => {
    if(err){
      console.error('Error fetching tasks', err);
      return res.status(500).json({ error: "Failed to get tasks" })
    }

    res.json(results);
  })
}

const submitReport = (req, res) => {
  uploadReportsPDF(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: err.message || "File upload failed" });
    }

    const { projectId } = req.params;
    const { title, summary, milestoneId, created_by, } = req.body;

    if (!projectId || !title || !created_by || !milestoneId) {
      return res.status(400).json({ error: "projectId, title, and created_by are required" });
    }

    const fileUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;

    const query = `
      INSERT INTO reports (project_id, title, summary, file_url, milestone_id, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(
      query,
      [projectId, title, summary || null, fileUrl, milestoneId, created_by],
      (err, result) => {
        if (err) {
          console.error("Error inserting report:", err);
          return res.status(500).json({ error: "Database error inserting report" });
        }

        return res.status(201).json({
          message: "Report submitted successfully",
          report: {
            id: result.insertId,
            project_id: projectId,
            title,
            summary,
            file_url: fileUrl,
            milestoneId,
            created_by,
            created_at: new Date(),
          },
        });
      }
    );
  });
};

const getMilestoneTaskReports = (req, res) => {
  const { milestoneId } = req.params;

  const query = `
    SELECT 
      r.id,
      mt.title AS task_title,
      r.title,
      r.summary,
      r.file_url,
      r.report_type,
      r.created_at
    FROM reports r
    LEFT JOIN milestone_tasks mt on mt.id = r.task_id
    LEFT JOIN milestones m on m.id = mt.milestone_id
    WHERE m.id = ? AND r.review_status = "pending"
  `

  db.query(query, [milestoneId], (err, results) => {
    if (err) {
      console.error("Error fetching report:", err);
      return res.status(500).json({ error: "Error fetching report" });
    }

    res.json(results);
  })
};

// Get Payment Schedule by Project ID
const getPaymentScheduleByProject = (req, res) => {
  const { projectId } = req.params;

  const sql = `
    SELECT 
      ps.id AS schedule_id,
      ps.milestone_name,
      ps.due_date,
      ps.amount,
      ps.status,
      ps.paid_date,
      ps.created_at,
      ep.project_name,
      ep.client_id,
      ep.contract_id
    FROM payment_schedule ps
    JOIN engineer_projects ep ON ps.contract_id = ep.contract_id
    WHERE ep.id = ?
    ORDER BY ps.due_date ASC
  `;

  db.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching payment schedule:", err);
      return res.status(500).json({ error: "Failed to fetch payment schedule" });
    }

    res.json({
      results
    });
  });
};

const getLegals = (req, res) => { 
  const { projectId } = req.params;

  const query = `
    SELECT 
      c.id AS contract_id,
      c.contract_file_url,
      c.contract_signed_at
    FROM engineer_projects ep
    JOIN contracts c ON c.id = ep.contract_id
    WHERE ep.id = ?
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching legal documents:", err);
      return res.status(500).json({
        success: false,
        message: "Database error while fetching legals",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No legal documents found for this project",
      });
    }

    res.status(200).json({
      success: true,
      message: "Legal documents fetched successfully",
      data: results[0],
    });
  });
};

const getProjectDetails = (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ error: "Project ID is required" });
  }

  const query = `
    SELECT 
      p.id AS project_id,
      p.contract_id,
      p.project_name,
      p.location,
      p.status,
      p.start_date,
      p.end_date,
      p.created_at,
      c.start_date AS contract_start_date,
      c.end_date AS contract_end_date,
      pr.id AS proposal_id,
      pr.title AS proposal_title,
      pr.description AS proposal_description,
      pr.scope_of_work,
      l.client_name,
      l.site_location,
      l.latitude,
      l.longitude,
      l.site_visit_notes
    FROM engineer_projects p
    LEFT JOIN contracts c ON p.contract_id = c.id
    LEFT JOIN proposals pr ON c.proposal_id = pr.id
    LEFT JOIN leads l ON l.id = c.lead_id
    WHERE p.id = ?;
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching project details:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ project: results[0] });
  });
};

module.exports = { getEstimate, getMilestones, createExpense, 
  getExpenses, getPendingExpenses, updateEngineerApproval, 
  updateMilestoneStatus, createProjectWithClient, getContractById,
  createMilestone, getBoqByProject, getTasks, addTask, updateTask,
  deleteTask, getReports, submitReport, getMilestoneTaskReports, 
  getPaymentScheduleByProject, getLegals, getProjectDetails
};