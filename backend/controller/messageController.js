const db = require('../config/db');  // Importing the MySQL connection

const sendProjectMessage = (req, res) => {
  const { projectId } = req.params;
  const { senderId, message } = req.body;

  if (!senderId || !message || !projectId) {
    return res.status(400).json({ error: "Missing senderId, message, or projectId" });
  }

  const checkSenderQuery = `
    SELECT ep.client_id, pa.user_id AS assigned_user
    FROM engineer_projects ep
    LEFT JOIN project_assignments pa ON ep.id = pa.project_id
    WHERE ep.id = ?
  `;

  db.query(checkSenderQuery, [projectId], (err, result) => {
    if (err) {
      console.error("Database error when checking sender:", err);
      return res.status(500).json({ error: "Failed to verify sender access" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Convert IDs to numbers for reliable comparison
    const numericSenderId = Number(senderId);
    const clientId = Number(result[0].client_id);
    const assignedUserIds = result
      .map((r) => Number(r.assigned_user))
      .filter((id) => !isNaN(id));

    const isAssignedUser = assignedUserIds.includes(numericSenderId);
    const isClient = numericSenderId === clientId;

    if (!isAssignedUser && !isClient) {
      return res
        .status(403)
        .json({ error: "User not authorized to send messages in this project" });
    }

    const insertMessageQuery = `
      INSERT INTO project_chats (project_id, sender_id, message, created_at)
      VALUES (?, ?, ?, NOW())
    `;

    db.query(insertMessageQuery, [projectId, senderId, message], (err, result) => {
      if (err) {
        console.error("Error inserting message:", err);
        return res.status(500).json({ error: "Failed to send message" });
      }

      res.status(201).json({
        message: "Message sent successfully",
        messageData: {
          id: result.insertId,
          project_id: projectId,
          sender_id: senderId,
          message,
          sent_at: new Date().toISOString(),
        },
      });
    });
  });
};

const getProjectMessages = (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
        return res.status(400).json({ error: "Missing projectId" });
    }

    const query = `
        SELECT 
            pc.id,
            pc.project_id,
            pc.sender_id,
            u.full_name AS sender_name,
            pc.message,
            pc.created_at
        FROM project_chats pc
        JOIN users u ON pc.sender_id = u.id
        WHERE pc.project_id = 36
        ORDER BY pc.created_at ASC;
    `;

    db.query(query, [projectId], (err, results) => {
        if (err) {
            console.error("Error fetching project messages:", err);
            return res.status(500).json({ error: "Failed to fetch messages" });
        }

        res.status(200).json({ messages: results });
    });
};





module.exports = { sendProjectMessage, getProjectMessages };