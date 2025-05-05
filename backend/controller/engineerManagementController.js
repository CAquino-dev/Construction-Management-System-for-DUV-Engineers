const db = require("../config/db");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uploadDir = path.join(__dirname, '../uploads'); // Path to the uploads directory

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create the uploads directory if it doesn't exist
}


// Set up storage engine for Multer to save the uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure the path is correct
      cb(null, path.join(__dirname, '../uploads'));  // Go up one level to the root of the project
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileName = Date.now() + ext;  // Make the file name unique
      cb(null, fileName);  // Save the file with a unique name
    }
  });
  

// File upload middleware for handling project photo
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
}).single('project_photo');  // 'project_photo' is the field name in the form

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

// Create Project function with photo upload
const createProject = (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
  
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
  
      const project_photo = req.file ? `/uploads/${req.file.filename}` : null;  // Return relative URL instead of absolute path
  
      const insertQuery = `
        INSERT INTO engineer_projects (
          engineer_id, client_id, project_name, description, start_date, end_date, status,
          budget, cost_breakdown, location, payment_schedule, project_type, project_photo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
        project_type,
        project_photo  // Save the relative file path in the database
      ];
  
      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Error inserting project:', err);
          return res.status(500).json({ error: 'Failed to insert project' });
        }
  
        res.status(201).json({
          message: 'Project successfully added!',
          project_id: result.insertId
        });
      });
    });
  };
  
  


  const getClientProject = (req, res) => {
    const { clientId } = req.params;  // Get the clientId from the request params
  
    console.log("Client ID:", clientId);  // Debugging log to ensure clientId is passed correctly
  
    const query = `
      SELECT
        ep.id,
        ep.project_name,
        ep.description,
        ep.start_date,
        ep.end_date,
        ep.status,
        ep.budget,
        ep.location,
        ep.project_type,
        -- Modify to return relative path for project photo
        IFNULL(ep.project_photo, '') AS project_photo,
        u.full_name AS engineer_name
      FROM
        engineer_projects ep
      JOIN
        users u ON ep.engineer_id = u.id
      WHERE
        ep.client_id = ?;
    `;
  
    // Query the database for the projects of the client
    db.query(query, [clientId], (err, results) => {
      if (err) {
        console.error("Error fetching projects:", err);
        return res.status(500).json({ error: "Failed to fetch projects" });
      }
  
      // Modify the result to include the full URL to the project photo
      const modifiedResults = results.map((project) => {
        if (project.project_photo) {
          project.project_photo = `http://localhost:5000${project.project_photo}`;  // Modify the photo path
        }
        return project;
      });
  
      res.json({ projects: modifiedResults });
    });
  };
  
  
  


module.exports = { getEngineers, createProject, getClients, getClientProject };