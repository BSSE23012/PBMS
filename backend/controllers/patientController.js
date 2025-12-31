// // controllers/patientController.js
// const Patient = require('../models/patientModel');

// // @desc    Register a new patient
// // @route   POST /api/patients
// // @access  Public
// const registerPatient = async (req, res) => {
//   try {
//     const { firstName, lastName, email, phone, dateOfBirth } = req.body;

//     const patientExists = await Patient.findOne({ email });

//     if (patientExists) {
//       res.status(400).json({ message: 'Patient with this email already exists' });
//       return;
//     }

//     const patient = await Patient.create({
//       firstName,
//       lastName,
//       email,
//       phone,
//       dateOfBirth,
//     });

//     if (patient) {
//       res.status(201).json({
//         _id: patient._id,
//         firstName: patient.firstName,
//         lastName: patient.lastName,
//         email: patient.email,
//       });
//     } else {
//       res.status(400).json({ message: 'Invalid patient data' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// // @desc    Get patient by ID
// // @route   GET /api/patients/:id
// // @access  Public (for now, will be protected later)
// const getPatientById = async (req, res) => {
//   try {
//     const patient = await Patient.findById(req.params.id);

//     if (patient) {
//       res.json(patient);
//     } else {
//       res.status(404).json({ message: 'Patient not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// module.exports = {
//   registerPatient,
//   getPatientById,
// };

// controllers/patientController.js
const { PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../config/db');
const crypto = require('crypto'); // Built-in Node.js module to generate unique IDs

const PATIENTS_TABLE_NAME = 'Patients'; // Define table name as a constant

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Public
const registerPatient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth } = req.body;

    // 1. Check if a patient with this email already exists using the GSI
    const queryEmailParams = {
      TableName: PATIENTS_TABLE_NAME,
      IndexName: 'email-index', // The GSI we planned
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
    };
    const emailQueryResult = await docClient.send(new QueryCommand(queryEmailParams));

    if (emailQueryResult.Items && emailQueryResult.Items.length > 0) {
      return res.status(400).json({ message: 'Patient with this email already exists' });
    }

    // 2. If email is unique, create the new patient item
    const patientId = crypto.randomUUID(); // Generate a secure, unique ID
    const newPatient = {
      patientId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      createdAt: new Date().toISOString(),
    };

    const putParams = {
      TableName: PATIENTS_TABLE_NAME,
      Item: newPatient,
    };

    await docClient.send(new PutCommand(putParams));
    
    // Return a simplified object, similar to the original response
    res.status(201).json({
      patientId: newPatient.patientId,
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      email: newPatient.email,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Public
const getPatientById = async (req, res) => {
  try {
    const params = {
      TableName: PATIENTS_TABLE_NAME,
      Key: {
        patientId: req.params.id,
      },
    };

    const { Item } = await docClient.send(new GetCommand(params));

    if (Item) {
      res.json(Item);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  registerPatient,
  getPatientById,
};