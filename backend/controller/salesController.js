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
    const query = `SELECT l.*
FROM leads l
INNER JOIN site_visits sv ON sv.lead_id = l.id
WHERE l.status NOT IN ('approved')
ORDER BY l.created_at DESC;`;

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching leads:', error);
            return res.status(500).json({ error: 'Failed to fetch leads' });
        }

        res.status(200).json(results);
    });
};

const getLeadsList = (req, res) => {
    const query = `SELECT * FROM leads WHERE status = "site_scheduled"`;

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching leads:', error);
            return res.status(500).json({ error: 'Failed to fetch leads' });
        }

        res.status(200).json(results);
    });
};

const getSiteVisitReport = (req, res) => {
  const { leadId } = req.params;

  const query = `
SELECT 
l.client_name,
l.latitude,
l.longitude,
s.date_visited,
s.location,
s.terrain_type,
s.accessibility,
s.water_source,
s.power_source,
s.area_measurement,
s.notes,
s.report_file_url,
s.created_at,
u.full_name AS created_by
FROM leads l 
JOIN site_visits s ON s.lead_id = l.id
JOIN users u ON u.id = s.created_by
WHERE l.id = ?`

db.query(query, [leadId], (err, result) => {
  if(err){
    console.log("faled to get site visit details", err);
    return res.status(400).json({ error: 'Failed to fetch site visit report' })
  }
  res.json(result);
});

}
module.exports = { createLead, getLeads, getLeadsList, getSiteVisitReport };