const express = require("express");
const router = express.Router();

const { createAppointment, updateAppointmentStatus, getAllAppointments } = require("../controller/appoinmentController") //import from authController 

router.post("/appointments", createAppointment);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.get('/getAppointments', getAllAppointments);

module.exports = router;