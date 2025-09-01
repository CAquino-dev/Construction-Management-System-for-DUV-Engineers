const db = require('../config/db');

const getForemanTasks = (req, res) => {
  const { foremanId } = req.params;

  const query = `
    SELECT
      mt.id as task_id,
      mt.title as task_title,
      mt.details,
      mt.start_date,
      mt.due_date,
      mt.status,
      mt.priority,
      m.id as milestone_id,
      m.title as milestone_title
    FROM milestone_tasks mt
    JOIN milestones m on mt.milestone_id = m.id
    WHERE mt.assigned_to = ?
    ORDER BY m.id, mt.id
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
        priority: row.priority
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

const addWorker = (req, res) => {
  const { teamId } =  req.params;
  const {
    name,
    contact,
    skill_type,
    status
  } = req.body;
  
  const query = 'INSERT INTO workers (team_id, name, contact, skill_type, status) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [teamId, name, contact, skill_type, status], (err, results) => {
    if(err){
      console.error("error creating worker", err);
      return res.status(500).json({ error: "Failed to create worker" });
    }

    return res.json({
      id: results.insertId,
      team_id: teamId,
      name,
      contact,
      skill_type,
      status
    })
  })
}


module.exports = { getForemanTasks, getForemanMaterials, addTeam, getForemanTeam, addWorker }