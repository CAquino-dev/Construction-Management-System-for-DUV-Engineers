const express = require("express");
const router = express.Router();

const { getForemanTasks, getForemanMaterials, getForemanTeam, 
    addTeam, addWorker } = require('../controller/foremanController');

router.get('/getTasks/:foremanId', getForemanTasks);
router.get('/getMaterials/:taskId', getForemanMaterials);
router.get('/getTeams/:foremanId', getForemanTeam);
router.post('/addTeam/:foremanId', addTeam);
router.post('/addWorker/:teamId', addWorker);

module.exports = router;