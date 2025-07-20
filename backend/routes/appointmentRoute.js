const express = require("express");
const router = express.Router();

const { createAppointment, updateAppointmentStatus, getAllAppointments, getBookedSlots, adminCreateAppointment } = require("../controller/appoinmentController") //import from authController 

router.post("/appointments", createAppointment);
router.post("/adminAppointments", adminCreateAppointment);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.get('/getAppointments', getAllAppointments);
router.get('/booked', getBookedSlots);

module.exports = router;