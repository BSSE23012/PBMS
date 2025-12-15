// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerPatient,
  getPatientById,
} = require('../controllers/patientController');

// Route for registering a new patient
router.post('/', registerPatient);

// Route for getting a single patient by their ID
router.get('/:id', getPatientById);

module.exports = router;