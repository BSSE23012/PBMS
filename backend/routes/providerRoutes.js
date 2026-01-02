// routes/providerRoutes.js

const express = require('express');
const router = express.Router();
// CORRECTED: Import from the new providerController
const { upsertProviderProfile, getAllProviders, getPatientName, getMyPatients } = require('../controllers/providerController'); 
const { protect, authorize } = require('../middleware/authMiddleware');

// A provider creating or updating their own profile
router.post('/profile', protect, authorize('Providers'), upsertProviderProfile);

// Any user (even unauthenticated) can see a list of doctors
router.get('/', getAllProviders);

router.get('/my-patients', protect, authorize('Providers'), getMyPatients);

router.get('/patient/:patientId', protect, authorize('Providers'), getPatientName);

module.exports = router;