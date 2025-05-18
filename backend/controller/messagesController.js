const db = require("../config/db");

// Fetch all messages for a given project (ordered by timestamp)
const getMessagesByProject = (req, res) => {
  const { projectId } = req.params;

  const query = `
    SELECT m.*, u.username 
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.project_id = ?
    ORDER BY m.timestamp ASC
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error fetching messages' });
    }
    res.json(results);
  });
};

// Post a new message
const postMessage = (req, res) => {
  const { project_id, user_id, message } = req.body;

  if (!project_id || !user_id || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO messages (project_id, user_id, message) VALUES (?, ?, ?)';
  db.query(query, [project_id, user_id, message], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error inserting message' });
    }

    // Return the inserted message with username and timestamp
    const insertedId = result.insertId;
    const fetchQuery = `
      SELECT m.*, u.username 
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `;

    db.query(fetchQuery, [insertedId], (err2, messages) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Database error fetching new message' });
      }
      res.json(messages[0]);
    });
  });
};

module.exports = { getMessagesByProject, postMessage };
