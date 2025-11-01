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

const getMilestoneBudget = (req, res) => {
  const { milestoneId } = req.params;

  const query = `
    SELECT
      m.id AS milestone_id,
      m.project_id,
      m.timestamp,
      m.title,
      m.details,
      m.status,
      m.start_date,
      m.due_date,

      mb.id AS milestone_boq_id,
      b.id AS boq_id,
      b.item_no,
      b.description AS boq_description,
      b.unit AS boq_unit,
      b.quantity AS boq_quantity,
      b.unit_cost AS boq_unit_cost,
      b.total_cost AS boq_total_cost,

      -- MTO
      mm.id AS mto_id,
      mm.description AS mto_description,
      mm.unit AS mto_unit,
      mm.quantity AS mto_quantity,
      mm.unit_cost AS mto_unit_cost,
      mm.total_cost AS mto_total_cost,

      -- LTO
      ml.id AS lto_id,
      ml.description AS lto_description,
      ml.allocated_budget AS lto_total_cost,
      ml.remarks AS lto_remarks,

      -- ETO
      me.id AS eto_id,
      me.equipment_name AS eto_equipment_name,
      me.days AS eto_days,
      me.daily_rate AS eto_daily_rate,
      me.total_cost AS eto_total_cost

    FROM milestones m
    LEFT JOIN milestone_boq mb ON m.id = mb.milestone_id
    LEFT JOIN boq b ON mb.boq_id = b.id
    LEFT JOIN milestone_mto mm ON mb.id = mm.milestone_boq_id
    LEFT JOIN milestone_lto ml ON mb.id = ml.milestone_boq_id
    LEFT JOIN milestone_eto me ON mb.id = me.milestone_boq_id
    WHERE m.id = ? AND m.status IN ('For Procurement', 'Finance Approved', "Delivered", "Pending Delivery")
    ORDER BY mb.id, mm.id, me.id
  `;

  db.query(query, [milestoneId], (err, results) => {
    if (err) {
      console.error("Error fetching milestone budget:", err);
      return res.status(500).json({ error: "Failed to fetch milestone budget" });
    }

    if (!results.length) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    const milestone = {
      id: results[0].milestone_id,
      project_id: results[0].project_id,
      timestamp: results[0].timestamp,
      title: results[0].title,
      details: results[0].details,
      status: results[0].status,
      start_date: results[0].start_date,
      due_date: results[0].due_date,
      boq_items: [],
    };

    results.forEach((row) => {
      if (row.milestone_boq_id) {
        let boqItem = milestone.boq_items.find(
          (b) => b.milestone_boq_id === row.milestone_boq_id
        );

        if (!boqItem) {
          boqItem = {
            milestone_boq_id: row.milestone_boq_id,
            boq_id: row.boq_id,
            item_no: row.item_no,
            description: row.boq_description,
            unit: row.boq_unit,
            quantity: row.boq_quantity,
            unit_cost: row.boq_unit_cost,
            total_cost: row.boq_total_cost,
            mto_items: [],
            lto: null,
            eto_items: [], // ✅ added ETO array
          };
          milestone.boq_items.push(boqItem);
        }

        // MTO
        if (row.mto_id && !boqItem.mto_items.some((m) => m.mto_id === row.mto_id)) {
          boqItem.mto_items.push({
            mto_id: row.mto_id,
            description: row.mto_description,
            unit: row.mto_unit,
            quantity: row.mto_quantity,
            unit_cost: row.mto_unit_cost,
            total_cost: row.mto_total_cost,
          });
        }

        // LTO (single)
        if (row.lto_id && !boqItem.lto) {
          boqItem.lto = {
            lto_id: row.lto_id,
            description: row.lto_description,
            total_cost: row.lto_total_cost,
            remarks: row.lto_remarks,
          };
        }

        // ETO - multiple equipments
        if (row.eto_id && !boqItem.eto_items.some((e) => e.eto_id === row.eto_id)) {
          boqItem.eto_items.push({
            eto_id: row.eto_id,
            equipment_name: row.eto_equipment_name,
            days: row.eto_days,
            daily_rate: row.eto_daily_rate,
            total_cost: row.eto_total_cost,
          });
        }
      }
    });

    res.json({ milestone });
  });
};

module.exports = { addReportComment, getReportComment, getMilestoneBudget};