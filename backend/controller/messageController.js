const db = require('../config/db');  // Importing the MySQL connection

const sendProjectMessage = (req, res) => {
    const { projectId } = req.params;
    const { senderId, message } = req.body;

    // Basic input validation
    if (!senderId || !message || !projectId) {
        return res.status(400).json({ error: "Missing senderId, message, or projectId" });
    }

    // Step 1: Check if sender is assigned to the project
    const checkAssignmentQuery = `
        SELECT * FROM project_assignments 
        WHERE project_id = ? AND user_id = ?
    `;

    db.query(checkAssignmentQuery, [projectId, senderId], (err, assignmentResult) => {
        if (err) {
            console.error("Database error when checking assignment:", err);
            return res.status(500).json({ error: "Failed to verify project assignment" });
        }

        if (assignmentResult.length === 0) {
            return res.status(403).json({ error: "User is not assigned to this project" });
        }

        // Step 2: Insert the message
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
                    sent_at: new Date().toISOString()
                }
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
            r.role_name AS sender_role,
            pc.message,
            pc.created_at
        FROM project_chats pc
        JOIN users u ON pc.sender_id = u.id
        JOIN permissions r ON u.role_id = r.id
        WHERE pc.project_id = ?
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