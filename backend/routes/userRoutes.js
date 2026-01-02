// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { assignPatientGroup, createPatientProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// This endpoint will be called by our frontend after a successful signup confirmation.
router.post('/assign-patient-group', assignPatientGroup);

router.post('/profile', protect, authorize('Patients'), createPatientProfile); 

module.exports = router;