// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const { bookAppointment, getPatientAppointments, cancelAppointment, getProviderAppointments } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Patients'), bookAppointment);
router.get('/my-appointments', protect, authorize('Patients'), getPatientAppointments);
router.get('/provider/me', protect, authorize('Providers'), getProviderAppointments);
router.put('/:appointmentId/cancel', protect, cancelAppointment);

module.exports = router;