const db = require("../config/db");

const getEngineers = (req, res) => {
    query = 'SELECT * FROM users WHERE department_id = 4'

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch engineer records" });
        res.json(results);
    })
}

const getClients = (req, res) => {
    const query = 'SELECT * FROM users WHERE role_id IS NULL';

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch engineer records" });
        res.json(results);
    })
}

const createProject = (req, res) => {
    const {
        engineer_id,
        client_id,
        project_name,
        description,
        start_date,
        end_date,
        status,
        budget,
        cost_breakdown,
        location,
        payment_schedule,
        project_type
    } = req.body;

    // Input validation (basic)
    if (!engineer_id || !client_id || !project_name || !start_date || !status || !budget || !project_type) {
        return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // SQL query to insert a new project into the engineer_projects table
    const insertQuery = `
        INSERT INTO engineer_projects (
            engineer_id,
            client_id,
            project_name,
            description,
            start_date,
            end_date,
            status,
            budget,
            cost_breakdown,
            location,
            payment_schedule,
            project_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        engineer_id,
        client_id,
        project_name,
        description,
        start_date,
        end_date,
        status,
        budget,
        cost_breakdown,
        location,
        payment_schedule,
        project_type
    ];

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error('Error inserting project:', err);
            return res.status(500).json({ error: 'Failed to insert project' });
        }

        // Return success response
        res.status(201).json({
            message: 'Project successfully added!',
            project_id: result.insertId
        });
    });
};

const getClientProject = (req, res) => {
    const { clientId } = req.params;  // Get the clientId from the request params
  
    console.log("Client ID:", clientId);  // Debugging log to ensure clientId is passed correctly
  
    const query = `
      SELECT *
      FROM engineer_projects
      WHERE client_id = ?
    `;
  
    // Query the database for the projects of the client
    db.query(query, [clientId], (err, results) => {
      if (err) {
        console.error("Error fetching projects:", err);
        return res.status(500).json({ error: "Failed to fetch projects" });
      }
  
      console.log("Results:", results);  // Debugging log to see the data returned
  
      // Send the results back to the client
      res.json({ projects: results });
    });
  };
  
  


module.exports = { getEngineers, createProject, getClients, getClientProject };