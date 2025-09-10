const express = require("express");
const router = express.Router();

const { getForemanTasks, getForemanMaterials, getForemanTeam, 
    addTeam, addWorker, assignTeam, foremanReport, getWorkerById, scanWorker } = require('../controller/foremanController');

router.get('/getTasks/:foremanId', getForemanTasks);
router.get('/getMaterials/:taskId', getForemanMaterials);
router.get('/getTeams/:foremanId', getForemanTeam);
router.get('/getWorker/:workerId', getWorkerById);
router.post('/scanWorker', scanWorker);
router.post('/addTeam/:foremanId', addTeam);
router.post('/addWorker/:teamId', addWorker);
router.post('/assignTeam', assignTeam);
router.post('/foremanReport', foremanReport);

module.exports = router;