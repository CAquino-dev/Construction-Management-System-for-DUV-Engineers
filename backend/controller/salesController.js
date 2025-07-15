const db = require('../config/db');  // Importing the MySQL connection

const createLead = (req, res) => {
    const { client_name, contact_info, project_interest, budget, timeline } = req.body;

    // Validate required fields

    const query = `
    INSERT INTO leads (client_name, contact_info, project_interest, budget, timeline, status)
    VALUES (?, ?, ?, ?, ?, 'new');
    `;

    db.query(query, [client_name, contact_info, project_interest, budget || null, timeline || null], (error, results) => {
        if (error) {
            console.error('Error creating lead:', error);
            return res.status(500).json({ error: 'Failed to create lead' });
        }

        res.status(201).json({
            message: 'Lead created successfully',
            leadId: results.insertId
        });
    });
};

const getLeads = (req, res) => {
    const query = `SELECT * FROM leads WHERE status NOT IN ('approved') ORDER BY created_at DESC`;

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching leads:', error);
            return res.status(500).json({ error: 'Failed to fetch leads' });
        }

        res.status(200).json(results);
    });
};

module.exports = { createLead, getLeads };