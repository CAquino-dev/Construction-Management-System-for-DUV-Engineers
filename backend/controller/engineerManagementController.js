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

  const uploadMilestonePdf = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: (req, file, cb) => {
    // Only accept PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
}).single('estimated_cost_pdf'); // <-- input field name from frontend
  

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
  
//   const getEngineerProjects = (req, res) => {
//     const { engineerId } = req.params;  // Get engineerId from request params

//     // SQL query to fetch all projects assigned to the engineer
//     const query = `
//         SELECT ep.id, ep.project_name, ep.description, ep.start_date, ep.end_date, ep.status, 
//                ep.budget, ep.location, ep.project_type, ep.project_photo, 
//                u.full_name AS client_name
//         FROM engineer_projects ep
//         JOIN users u ON ep.client_id = u.id
//         WHERE ep.engineer_id = ?;
//     `;

//     db.query(query, [engineerId], (err, results) => {
//         if (err) {
//             console.error("Error fetching engineer's projects:", err);
//             return res.status(500).json({ error: "Failed to fetch engineer's projects" });
//         }

//         // Send the list of projects as a response
//         res.json({ projects: results });
//     });
// };

const getEngineerProjects = (req, res) => {
    const { employeeId } = req.params;  // Get employeeId from request params

    // SQL query to fetch all projects assigned to the employee
    const query = `
        SELECT 
            p.id, 
            p.project_name, 
            p.description, 
            p.start_date, 
            p.end_date, 
            p.status, 
            p.budget, 
            p.location, 
            p.project_type, 
            p.project_photo, 
            u.full_name AS client_name
        FROM project_assignments pa
        JOIN engineer_projects p ON pa.project_id = p.id
        JOIN users u ON p.client_id = u.id
        WHERE pa.user_id = ?;
    `;

    db.query(query, [employeeId], (err, results) => {
        if (err) {
            console.error("Error fetching employee's projects:", err);
            return res.status(500).json({ error: "Failed to fetch employee's projects" });
        }

        res.json({ projects: results });
    });
};

// Create Milestone function
const createMilestone = (req, res) => {
  const {
    project_id,
    title,
    details,
    start_date,
    due_date,
    boq_item_ids, // array of BOQ item IDs
    mto_items // object: { "2": [...], "3": [...] }
  } = req.body;

  if (!title || !details) return res.status(400).json({ error: 'Title and details are required' });
  if (!Array.isArray(boq_item_ids) || !boq_item_ids.length) return res.status(400).json({ error: 'At least one BOQ item must be selected' });

  const timestamp = new Date().toISOString();
  const progress_status = 'Pending';

  // Step 1: Insert milestone
  const milestoneQuery = `
    INSERT INTO milestones
    (project_id, timestamp, title, details, start_date, due_date, progress_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(milestoneQuery, [project_id, timestamp, title, details, start_date || null, due_date || null, progress_status], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create milestone' });

    const milestoneId = result.insertId;
    const milestoneBoqIds = [];

    // Step 2: Insert BOQ items one by one
    const insertBoqItem = (index) => {
      if (index >= boq_item_ids.length) {
        // All BOQ items inserted, now insert MTOs
        insertMTOs();
        return;
      }

      const boqId = boq_item_ids[index];
      const junctionQuery = `INSERT INTO milestone_boq (milestone_id, boq_id) VALUES (?, ?)`;
      db.query(junctionQuery, [milestoneId, boqId], (err2, junctionResult) => {
        if (err2) return res.status(500).json({ error: 'Failed to link BOQ items' });

        milestoneBoqIds.push({ boq_id: boqId, milestone_boq_id: junctionResult.insertId });
        insertBoqItem(index + 1);
      });
    };

    insertBoqItem(0);

    // Step 3: Insert MTO items
    const insertMTOs = () => {
      if (!mto_items || Object.keys(mto_items).length === 0) {
        return res.status(201).json({ message: 'Milestone created successfully (no MTO)', milestoneId });
      }

      let insertedCount = 0;

      milestoneBoqIds.forEach(({ boq_id, milestone_boq_id }) => {
        const itemsForBoq = mto_items[boq_id]; // get array from object
        if (!itemsForBoq || !itemsForBoq.length) {
          insertedCount++;
          if (insertedCount === milestoneBoqIds.length) {
            return res.status(201).json({ message: 'Milestone and MTO created successfully', milestoneId });
          }
          return;
        }

        const mtoValues = itemsForBoq.map(item => [
          milestone_boq_id,
          item.description,
          item.unit,
          item.quantity,
          item.unit_cost
        ]);

        const mtoQuery = `
          INSERT INTO milestone_mto
          (milestone_boq_id, description, unit, quantity, unit_cost)
          VALUES ?
        `;

        db.query(mtoQuery, [mtoValues], (errMto) => {
          if (errMto) return res.status(500).json({ error: 'Failed to create MTO items' });

          insertedCount++;
          if (insertedCount === milestoneBoqIds.length) {
            return res.status(201).json({ message: 'Milestone and MTO created successfully', milestoneId });
          }
        });
      });
    };
  });
};





const getMilestonesForPaymentByProject = (req, res) => {
  const projectId = req.params.projectId;

  const query = `
    SELECT id, status, details, payment_amount, progress_status
    FROM milestones
    WHERE project_id = ? AND progress_status = 'For Payment'
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching milestones for payment:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
};

const completeMilestone = (req, res) => {
  // Use your existing 'upload' middleware for file upload with field name 'project_photo'
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    const milestoneId = req.params.id;
    if (!milestoneId) {
      return res.status(400).json({ error: 'Milestone ID is required' });
    }

    // Build the path for uploaded photo if any
    const projectPhotoPath = req.file ? `/uploads/${req.file.filename}` : null;

    // We will update:
    // - progress_status = 'Completed'
    // - completion_date = current date (if you want to set)
    // - project_photo = photo path (optional)
    const query = `
      UPDATE milestones
      SET progress_status = 'Completed',
          completion_date = NOW(),
          project_photo = ?
      WHERE id = ?
    `;

    db.query(query, [projectPhotoPath, milestoneId], (err, result) => {
      if (err) {
        console.error('Error updating milestone:', err);
        return res.status(500).json({ error: 'Failed to update milestone' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Milestone not found' });
      }

      res.json({
        message: 'Milestone marked as completed',
        completionPhoto: projectPhotoPath,
      });
    });
  });
};


  


module.exports = { getEngineers, createProject, getClients, 
                  getClientProject, getEngineerProjects, createMilestone,
                getMilestonesForPaymentByProject, completeMilestone };