const { PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

// @desc    Add a new health record for a patient
// @route   POST /api/health-records
// @access  Private (Providers only)
const addHealthRecord = async (req, res) => {
  const { patientId, recordType, details, providerNotes } = req.body;

  if (!patientId || !recordType || !details) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  const recordId = uuidv4();
  const item = {
    PK: `PATIENT#${patientId}`,
    SK: `RECORD#${recordType.toUpperCase()}#${recordId}`,
    recordId,
    recordType: recordType.toUpperCase(),
    details, // This can be a map/object: { "name": "Lisinopril", "dosage": "10mg" }
    providerNotes,
    dateRecorded: new Date().toISOString(),
    providerId: req.user.sub, // Log which provider created the record
  };

  try {
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding health record', error: error.message });
  }
};

// @desc    Get all health records for a specific patient
// @route   GET /api/health-records/patient/:patientId
// @access  Private (The patient themselves or any provider)
const getPatientHealthRecords = async (req, res) => {
  const { patientId } = req.params;
  const requesterId = req.user.sub;
  const requesterGroups = req.user['cognito:groups'] || [];

  // Authorization check: Allow if the requester is the patient OR is a provider
  if (requesterId !== patientId && !requesterGroups.includes('Providers')) {
    return res.status(403).json({ message: 'Not authorized to view these records' });
  }

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PATIENT#${patientId}`,
      ':sk': 'RECORD#',
    },
  };
  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    res.json(Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching health records', error: error.message });
  }
};

module.exports = { addHealthRecord, getPatientHealthRecords };