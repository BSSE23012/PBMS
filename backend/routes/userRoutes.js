// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { assignPatientGroup } = require('../controllers/userController');

// This endpoint will be called by our frontend after a successful signup confirmation.
router.post('/assign-patient-group', assignPatientGroup);

module.exports = router;