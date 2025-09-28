const db = require("../config/db");

const addReportComment = (req, res) => {
  const { reportId } = req.params;
  const { milestoneId, userId, comment } = req.body;

  if (!reportId || !userId || !comment) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const insertQuery = `
    INSERT INTO comments (report_id, milestone_id, user_id, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertQuery, [reportId, milestoneId, userId, comment], (err, result) => {
    if (err) {
      console.error("Error inserting comment:", err);
      return res.status(500).json({ error: "Failed to add comment" });
    }

    const selectQuery = `
      SELECT 
        c.id, 
        c.report_id, 
        c.milestone_id, 
        c.user_id, 
        c.comment, 
        c.created_at,
        u.full_name AS user_name,
        COALESCE(p.role_name, 'client') AS role_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN permissions p ON u.role_id = p.id
      WHERE c.id = ?
    `;

    db.query(selectQuery, [result.insertId], (err2, rows) => {
      if (err2) {
        console.error("Error fetching new comment:", err2);
        return res.status(500).json({ error: "Failed to fetch comment" });
      }
      res.json(rows[0]); // return the full new comment with user + role
    });
  });
};


const getReportComment = (req, res) => {
    const { reportId } = req.params;

    if (!reportId) {
        return res.status(400).json({ error: "Report ID is required" });
    }

    const query = `
    SELECT 
        c.id, 
        c.report_id, 
        c.milestone_id, 
        c.user_id, 
        c.comment, 
        c.created_at,
        u.full_name AS user_name,
        COALESCE(p.role_name, 'client') AS role_name
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN permissions p ON u.role_id = p.id
    WHERE c.report_id = ?
    ORDER BY c.created_at ASC;
    `;

    db.query(query, [reportId], (err, results) => {
        if (err) {
            console.error("Error fetching comments:", err);
            return res.status(500).json({ error: "Failed to fetch comments" });
        }
        res.json(results);
    });
};


module.exports = { addReportComment, getReportComment };