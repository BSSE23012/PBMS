// controllers/providerController.js

const { PutCommand, ScanCommand, GetCommand, QueryCommand  } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../config/db');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

// @desc    Create or update a provider's profile.
// @route   POST /api/providers/profile
// @access  Private (Providers only)
const upsertProviderProfile = async (req, res) => {
  // The provider's unique ID comes from their Cognito token's 'sub' claim
  const providerId = req.user.sub; 
  const { specialty, bio, given_name, family_name } = req.body;

  if (!specialty || !bio || !given_name || !family_name) {
      return res.status(400).json({ message: 'Missing required profile fields' });
  }

  const item = {
    PK: `PROVIDER#${providerId}`,
    SK: 'METADATA',
    providerId: providerId,
    userType: 'PROVIDER',
    specialty,
    bio,
    given_name,
    family_name,
    email: req.user.email, // We get the email from the validated token
  };

  try {
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    res.status(201).json(item);
  } catch (error)
  {
    console.error(error);
    res.status(500).json({ message: 'Error creating or updating provider profile', error: error.message });
  }
};

// @desc    Get a list of all providers
// @route   GET /api/providers
// @access  Public
const getAllProviders = async (req, res) => {
  // NOTE: A Scan operation reads every item in the table and can be inefficient and costly for large tables. 
  // For a student project with a small number of providers, it is acceptable.
  // In a production app, this would be implemented with a Global Secondary Index (GSI).
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'userType = :userType',
    ExpressionAttributeValues: { ':userType': 'PROVIDER' },
  };

  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    res.json(Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching providers', error: error.message });
  }
};


// @desc    Get basic patient info by ID
// @route   GET /api/providers/patient/:patientId
// @access  Private (Providers only)
const getPatientName = async (req, res) => {
  const { patientId } = req.params;
  const requesterGroups = req.user['cognito:groups'] || [];

  if (!requesterGroups.includes('Providers')) {
    return res.status(403).json({ message: 'Only providers can access patient information.' });
  }

  // We query the DynamoDB table for the patient's metadata using their ID
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `PATIENT#${patientId}`,
      SK: 'METADATA', // We are looking for the user's profile metadata
    },
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    if (Item && Item.userType === 'PATIENT') {
      res.json({
        patientId: Item.userId,
        given_name: Item.given_name,
        family_name: Item.family_name,
      });
    } else {
      res.status(404).json({ message: 'Patient not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient information', error: error.message });
  }
};

// @desc    Get a unique list of all patients for the logged-in provider
// @route   GET /api/providers/my-patients
// @access  Private (Providers only)
const getMyPatients = async (req, res) => {
  const providerId = req.user.sub;

  // Use the same GSI query as the provider dashboard to get all appointments
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'ProviderScheduleIndex',
    KeyConditionExpression: 'providerId = :pid',
    ExpressionAttributeValues: { ':pid': providerId },
  };

  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    
    // Use a Map to automatically handle de-duplication of patients
    const patientsMap = new Map();
    Items.forEach(app => {
      if (!patientsMap.has(app.patientId)) {
        patientsMap.set(app.patientId, {
          patientId: app.patientId,
          patientName: app.patientName,
        });
      }
    });

    const uniquePatients = Array.from(patientsMap.values());
    
    res.json(uniquePatients);
  } catch (error) {
    console.error("Error fetching provider's patients:", error);
    res.status(500).json({ message: 'Error fetching your patients', error: error.message });
  }
};


module.exports = { 
  upsertProviderProfile, 
  getAllProviders, 
  getPatientName,
  getMyPatients,
};