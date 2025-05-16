// controllers/projectController.js
const db = require('../config/db');  // Importing the MySQL connection

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
      completion_date
    FROM milestones
    WHERE project_id = ?
    ORDER BY timestamp DESC
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching milestones:", err);
      return res.status(500).json({ error: "Failed to fetch milestones" });
    }
    res.json({ milestones: results });
  });
};




module.exports = { getEstimate, getMilestones };
