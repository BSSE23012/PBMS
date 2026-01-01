const express = require('express');
const router = express.Router();
const { bookAppointment, getPatientAppointments, cancelAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Patients'), bookAppointment);
router.get('/my-appointments', protect, authorize('Patients'), getPatientAppointments);
router.put('/:appointmentId/cancel', protect, cancelAppointment); // Anyone authenticated can cancel for now

module.exports = router;