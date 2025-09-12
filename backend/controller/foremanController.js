const db = require('../config/db');
const QRCode = require("qrcode");
const multer = require("multer");
const path = require('path');
const fs = require('fs');

const getForemanTasks = (req, res) => {
  const { foremanId } = req.params;

  const query = `
    SELECT
      mt.id AS task_id,
      mt.title AS task_title,
      mt.details,
      mt.start_date,
      mt.due_date,
      mt.status,
      mt.priority,
      m.id AS milestone_id,
      m.title AS milestone_title,
      ta.team_id
    FROM milestone_tasks mt
    JOIN milestones m ON mt.milestone_id = m.id
    LEFT JOIN team_assignments ta ON ta.task_id = mt.id
    WHERE mt.assigned_to = ?
    ORDER BY m.id, mt.id;
  `;

  db.query(query, [foremanId], (err, results) => {
    if (err) {
      console.error("Failed to fetch foreman tasks", err);
      return res.status(500).json({ error: "Failed to fetch foreman tasks" });
    }

    // Group tasks by milestone
    const milestones = {};
    results.forEach(row => {
      if (!milestones[row.milestone_id]) {
        milestones[row.milestone_id] = {
          milestone_id: row.milestone_id,
          milestone_title: row.milestone_title,
          tasks: []
        };
      }

      milestones[row.milestone_id].tasks.push({
        task_id: row.task_id,
        title: row.task_title,
        details: row.details,
        start_date: row.start_date,
        due_date: row.due_date,
        status: row.status,
        priority: row.priority,
        team_id: row.team_id // ✅ include team assignment
      });
    });

    res.json(Object.values(milestones));
  });
};


const getForemanMaterials = (req, res) => {
  const { taskId } = req.params;

  const query = `
  	SELECT 
    mm.id,
   	mm.description,
    mm.unit,
    mm.quantity
    from milestone_mto mm
	  JOIN milestone_boq mb on  mm.milestone_boq_id = mb.id 
    JOIN milestones m on m.id = mb.milestone_id 
    JOIN milestone_tasks mt on mt.milestone_id = m.id
    WHERE mt.id = ?
  `

  db.query(query, [taskId], (err, results) => {
    if (err) {
      console.error("Failed to fetch foreman tasks", err);
      return res.status(500).json({ error: "Failed to fetch foreman materials" });
    }

    res.json(results);
  })

}

const addTeam = (req, res) => {
  const { foremanId } = req.params;
  const { team_name } = req.body;

  const query = "INSERT INTO worker_teams (foreman_id, team_name) VALUES (?, ?)";

  db.query(query, [foremanId, team_name], (err, results) => {
    if (err) {
      console.error("Failed to create team", err);
      return res.status(500).json({ error: "Failed to create team" });
    }

    return res.json({
      message: "Team created successfully",
      team: {
        id: results.insertId,
        foreman_id: foremanId,
        team_name,
      },
    });
  });
};

const getForemanTeam = (req, res) => {
  const { foremanId } = req.params;

  const query = `
    SELECT 
      t.id AS team_id, 
      t.team_name,
      w.id AS worker_id,
      w.name,
      w.contact,
      w.skill_type,
      w.status
    FROM worker_teams t
    LEFT JOIN workers w ON w.team_id = t.id
    WHERE t.foreman_id = ?;
  `;

  db.query(query, [foremanId], (err, results) => {
    if (err) {
      console.error("Error fetching teams with workers", err);
      return res.status(500).json({ error: "Failed to fetch teams" });
    }

    // Group into teams
    const teams = {};
    results.forEach((row) => {
      if (!teams[row.team_id]) {
        teams[row.team_id] = {
          id: row.team_id,
          team_name: row.team_name,
          workers: [],
        };
      }
      if (row.worker_id) {
        teams[row.team_id].workers.push({
          id: row.worker_id,
          name: row.name,
          contact: row.contact,
          skill_type: row.skill_type,
          status: row.status,
        });
      }
    });

    res.json({ teams: Object.values(teams) });
  });
}

const uploadPhotoDir = path.join(__dirname, '../public/workerPhotos');
if (!fs.existsSync(uploadPhotoDir)) {
  fs.mkdirSync(uploadPhotoDir, { recursive: true });
}

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPhotoDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext;
    cb(null, fileName);
  },
});

const uploadWorkerPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
}).single("photo"); // field name from frontend

const addWorker = (req, res) => {
  uploadWorkerPhoto(req, res, (err) => {
    if (err) {
      console.error("Photo upload error:", err);
      return res.status(400).json({ error: err.message || "Photo upload failed" });
    }

    const { teamId } = req.params;
    const { name, contact, skill_type, status } = req.body;

    const photoPath = req.file ? `/workerPhotos/${req.file.filename}` : null;

    const query =
      "INSERT INTO workers (team_id, name, contact, skill_type, status, photo) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(query, [teamId, name, contact, skill_type, status, photoPath], (err, results) => {
      if (err) {
        console.error("error creating worker", err);
        return res.status(500).json({ error: "Failed to create worker" });
      }

      const workerId = results.insertId;
      const qrValue = `WORKER_${workerId}_${Date.now()}`;

      // Generate QR image
      QRCode.toDataURL(qrValue, (err, qrImage) => {
        if (err) {
          console.error("QR generation error", err);
          return res.status(500).json({ error: "Failed to generate QR code" });
        }

        // Save QR code in DB
        const updateQuery = "UPDATE workers SET qr_code = ? WHERE id = ?";
        db.query(updateQuery, [qrValue, workerId], (err2) => {
          if (err2) {
            console.error("Error saving QR to worker", err2);
            return res.status(500).json({ error: "Failed to save QR code" });
          }

          return res.json({
            id: workerId,
            team_id: teamId,
            name,
            contact,
            skill_type,
            status,
            photo: photoPath,
            qr_code: qrValue,
            qr_image: qrImage, // base64 PNG, frontend can render
          });
        });
      });
    });
  });
};


const getWorkerById = (req, res) => {
  const { workerId } = req.params;

  const query = "SELECT * FROM workers WHERE id = ?";
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error fetching worker", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Worker not found" });
    }

    const worker = results[0];

    // Generate QR image from saved qr_code
    QRCode.toDataURL(worker.qr_code, (err, qrImage) => {
      if (err) {
        console.error("QR generation error", err);
        return res.status(500).json({ error: "Failed to generate QR code" });
      }

      res.json({
        ...worker,
        qr_image: qrImage, // base64 PNG, frontend can show directly
      });
    });
  });
};

const assignTeam = (req, res) => {
  const { 
  taskId,
  teamId
  } = req.body;
  
  const query = 'INSERT INTO team_assignments(team_id, task_id) VALUES(?,?)';

  db.query(query, [teamId, taskId], (err, results) => {
    if(err){
      console.error("error creating worker", err);
      return res.status(500).json({ error: "Failed to create worker" });
    }

  return res.json({
    id: results.insertId,
    team_id: teamId, 
    task_id: taskId,
  });

  });
}

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

const foremanReport = (req, res) => {
  uploadReportsPDF(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: err.message || "File upload failed" });
    }

    const { title, taskId, summary, created_by, report_type } = req.body;

    if (!taskId || !title || !created_by) {
      return res.status(400).json({ error: "taskId, title, and created_by are required" });
    }

    const fileUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;

    const insertQuery = `
      INSERT INTO reports (task_id, title, summary, file_url, created_by, report_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(
      insertQuery,
      [taskId, title, summary || null, fileUrl, created_by, report_type || "Update"],
      (err, result) => {
        if (err) {
          console.error("Error inserting report:", err);
          return res.status(500).json({ error: "Database error inserting report" });
        }

        // ✅ If report is Final, update the task status
        if (report_type === "Final") {
          const updateTaskQuery = `
            UPDATE milestone_tasks
            SET status = 'For Review'
            WHERE id = ?
          `;
          db.query(updateTaskQuery, [taskId], (updateErr) => {
            if (updateErr) {
              console.error("Error updating task status:", updateErr);
              // don’t fail the request, just log
            }
          });
        }

        return res.status(201).json({
          message: "Report submitted successfully",
          report: {
            id: result.insertId,
            task_id: taskId,
            title,
            summary,
            file_url: fileUrl,
            created_by,
            report_type: report_type || "Update",
            created_at: new Date(),
          },
        });
      }
    );
  });
};

const scanWorker = (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "QR code is required" });
  }

  // 1. Find worker by QR code
  const workerQuery = "SELECT id, name, contact, team_id FROM workers WHERE qr_code = ? LIMIT 1";

  db.query(workerQuery, [code], (err, workers) => {
    if (err) {
      console.error("Error finding worker:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (workers.length === 0) {
      return res.status(404).json({ error: "Worker not found" });
    }

    const worker = workers[0];
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // 2. Check if attendance already exists for today
    const attendanceQuery = "SELECT * FROM worker_attendance WHERE worker_id = ? AND date = ? LIMIT 1";
    db.query(attendanceQuery, [worker.id, today], (err, records) => {
      if (err) {
        console.error("Error checking attendance:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (records.length === 0) {
        // First scan of the day → insert time_in
        const insertQuery = "INSERT INTO worker_attendance (worker_id, date, time_in) VALUES (?, ?, NOW())";
        db.query(insertQuery, [worker.id, today], (err, result) => {
          if (err) {
            console.error("Error inserting attendance:", err);
            return res.status(500).json({ error: "Database error" });
          }

          return res.json({
            message: "Time-in recorded",
            worker,
            attendance: { date: today, time_in: new Date(), time_out: null },
          });
        });
      } else {
        const attendance = records[0];
        if (!attendance.time_out) {
          // Second scan → update time_out
          const updateQuery = "UPDATE worker_attendance SET time_out = NOW() WHERE id = ?";
          db.query(updateQuery, [attendance.id], (err) => {
            if (err) {
              console.error("Error updating time_out:", err);
              return res.status(500).json({ error: "Database error" });
            }

            return res.json({
              message: "Time-out recorded",
              worker,
              attendance: { ...attendance, time_out: new Date() },
            });
          });
        } else {
          // Already timed out
          return res.json({
            message: "Attendance already completed for today",
            worker,
            attendance,
          });
        }
      }
    });
  });
};

module.exports = { getForemanTasks, getForemanMaterials, addTeam, 
  getForemanTeam, addWorker, assignTeam, 
  foremanReport, getWorkerById, scanWorker }