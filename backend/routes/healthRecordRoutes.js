// routes/healthRecordRoutes.js
const express = require('express');
const router = express.Router();
const { addHealthRecord, getMyHealthRecords, getPatientHealthRecordsForProvider } = require('../controllers/healthRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Providers add records for patients
router.post('/', protect, authorize('Providers'), addHealthRecord);

// Patients view their OWN records
router.get('/my-records', protect, authorize('Patients'), getMyHealthRecords);

// Providers view records of a SPECIFIC patient
router.get('/patient/:patientId', protect, authorize('Providers'), getPatientHealthRecordsForProvider);

module.exports = router;