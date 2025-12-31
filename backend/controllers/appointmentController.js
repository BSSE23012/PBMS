// // controllers/appointmentController.js
// const Appointment = require('../models/appointmentModel');
// const Patient = require('../models/patientModel');

// // @desc    Book a new appointment
// // @route   POST /api/appointments
// // @access  Public (Protected)
// const bookAppointment = async (req, res) => {
//   try {
//     const { patientId, appointmentDate, reason } = req.body;

//     // Check if patient exists
//     const patient = await Patient.findById(patientId);
//     if (!patient) {
//       return res.status(404).json({ message: 'Patient not found' });
//     }

//     const appointment = new Appointment({
//       patientId,
//       appointmentDate,
//       reason,
//     });

//     const createdAppointment = await appointment.save();
//     res.status(201).json(createdAppointment);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// // @desc    Get all appointments for a specific patient
// // @route   GET /api/appointments/patient/:patientId
// // @access  Public (Protected)
// const getAppointmentsForPatient = async (req, res) => {
//   try {
//     const appointments = await Appointment.find({ patientId: req.params.patientId });
//     if (!appointments) {
//         return res.status(404).json({ message: 'No appointments found for this patient' });
//     }
//     res.json(appointments);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// module.exports = {
//   bookAppointment,
//   getAppointmentsForPatient,
// };

// controllers/appointmentController.js
const { PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../config/db');
const crypto = require('crypto');

const APPOINTMENTS_TABLE_NAME = 'Appointments';
const PATIENTS_TABLE_NAME = 'Patients';

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Public (Protected)
const bookAppointment = async (req, res) => {
  try {
    const { patientId, appointmentDate, reason } = req.body;

    // 1. Check if patient exists
    const getPatientParams = {
        TableName: PATIENTS_TABLE_NAME,
        Key: { patientId },
    };
    const { Item: patient } = await docClient.send(new GetCommand(getPatientParams));

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // 2. Create the new appointment
    const appointmentId = crypto.randomUUID();
    const newAppointment = {
        appointmentId,
        patientId,
        appointmentDate,
        reason,
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
    };

    const putAppointmentParams = {
        TableName: APPOINTMENTS_TABLE_NAME,
        Item: newAppointment,
    };

    await docClient.send(new PutCommand(putAppointmentParams));
    res.status(201).json(newAppointment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all appointments for a specific patient
// @route   GET /api/appointments/patient/:patientId
// @access  Public (Protected)
const getAppointmentsForPatient = async (req, res) => {
  try {
    const params = {
      TableName: APPOINTMENTS_TABLE_NAME,
      IndexName: 'PatientIdIndex', // The GSI we planned
      KeyConditionExpression: 'patientId = :patientId',
      ExpressionAttributeValues: {
        ':patientId': req.params.patientId,
      },
    };
    
    const { Items } = await docClient.send(new QueryCommand(params));
    // The result is Items (plural), which is an array. It will be an empty array if none are found.
    res.json(Items || []); 
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  bookAppointment,
  getAppointmentsForPatient,
};