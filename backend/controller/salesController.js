const db = require('../config/db');  // Importing the MySQL connection

const createLead = (req, res) => {
  const {
    client_name,
    email,
    phone_number,
    project_interest,
    budget,
    timeline,
    site_visit_date,
    site_visit_time,
    site_visit_notes,
    site_location,
    latitude,
    longitude,
  } = req.body;

  // 🧾 Validate required fields
  if (!client_name || !email || !project_interest) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO leads 
    (client_name, email, phone_number, project_interest, budget, timeline, site_visit_date, site_visit_time, site_visit_notes, site_location, latitude, longitude, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'site_scheduled');
  `;

  const values = [
    client_name,
    email,
    phone_number || null,
    project_interest,
    budget || null,
    timeline || null,
    site_visit_date || null,
    site_visit_time || null,
    site_visit_notes || null,
    site_location || null,
    latitude || null,
    longitude || null,
  ];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error("❌ Error creating lead:", error);
      return res.status(500).json({ error: "Failed to create lead" });
    }

    res.status(201).json({
      message: "✅ Lead & site visit saved successfully",
      leadId: results.insertId,
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