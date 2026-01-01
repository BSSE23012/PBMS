const express = require('express');
const router = express.Router();
const { addHealthRecord, getPatientHealthRecords } = require('../controllers/healthRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Providers'), addHealthRecord);
router.get('/patient/:patientId', protect, getPatientHealthRecords);

module.exports = router;