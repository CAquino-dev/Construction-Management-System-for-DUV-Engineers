const express = require("express");
const router = express.Router();

const { createAppointment, updateAppointmentStatus, getAllAppointments, getBookedSlots } = require("../controller/appoinmentController") //import from authController 

router.post("/appointments", createAppointment);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.get('/getAppointments', getAllAppointments);
router.get('/booked', getBookedSlots);

module.exports = router;