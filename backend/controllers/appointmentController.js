// controllers/appointmentController.js
const Appointment = require('../models/appointmentModel');
const Patient = require('../models/patientModel');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Public (Protected)
const bookAppointment = async (req, res) => {
  try {
    const { patientId, appointmentDate, reason } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointment = new Appointment({
      patientId,
      appointmentDate,
      reason,
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all appointments for a specific patient
// @route   GET /api/appointments/patient/:patientId
// @access  Public (Protected)
const getAppointmentsForPatient = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId });
    if (!appointments) {
        return res.status(404).json({ message: 'No appointments found for this patient' });
    }
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  bookAppointment,
  getAppointmentsForPatient,
};