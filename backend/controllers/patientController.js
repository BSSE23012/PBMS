// controllers/patientController.js
const Patient = require('../models/patientModel');

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Public
const registerPatient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth } = req.body;

    const patientExists = await Patient.findOne({ email });

    if (patientExists) {
      res.status(400).json({ message: 'Patient with this email already exists' });
      return;
    }

    const patient = await Patient.create({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
    });

    if (patient) {
      res.status(201).json({
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid patient data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Public (for now, will be protected later)
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  registerPatient,
  getPatientById,
};