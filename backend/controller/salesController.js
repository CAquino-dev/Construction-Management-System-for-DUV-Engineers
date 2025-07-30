const db = require('../config/db');  // Importing the MySQL connection

const createLead = (req, res) => {
    const { client_name, email, phone_number, project_interest, budget, timeline } = req.body;

    // Validate required fields
    if (!client_name || !email || !project_interest) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO leads (client_name, email, phone_number, project_interest, budget, timeline, status)
        VALUES (?, ?, ?, ?, ?, ?, 'new');
    `;

    const values = [
        client_name,
        email,
        phone_number || null, // allow null phone number
        project_interest,
        budget || null,
        timeline || null
    ];

    db.query(query, values, (error, results) => {
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