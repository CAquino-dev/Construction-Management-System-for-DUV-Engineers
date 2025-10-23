const express = require("express");
const router = express.Router();

const { getForemanTasks, getForemanMaterials, getForemanTeam, 
    addTeam, addWorker, assignTeam, foremanReport, getWorkerById, 
    scanWorker, getForemanWorkers, getForemanReports, getTasksForReport,
    getWorkerAttendance } = require('../controller/foremanController');

router.get('/getTasks/:projectId', getForemanTasks);
router.get('/getTasksForReport/:projectId', getTasksForReport);
router.get('/getMaterials/:taskId', getForemanMaterials);
router.get('/getTeams/:foremanId', getForemanTeam);
router.get('/getWorker/:workerId', getWorkerById);
router.get('/getForemanWorkers', getForemanWorkers);
router.get('/getReports/:foremanId', getForemanReports);
router.get('/getAttendance/:userId', getWorkerAttendance);
router.post('/scanWorker', scanWorker);
router.post('/addTeam/:foremanId', addTeam);
router.post('/addWorker/:teamId', addWorker);
router.post('/assignTeam', assignTeam);
router.post('/foremanReport', foremanReport);

module.exports = router;