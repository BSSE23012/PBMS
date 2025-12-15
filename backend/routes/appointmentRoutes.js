// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointmentsForPatient,
} = require('../controllers/appointmentController');

// Route for booking a new appointment
router.post('/', bookAppointment);

// Route for getting all appointments for a specific patient
router.get('/patient/:patientId', getAppointmentsForPatient);

module.exports = router;