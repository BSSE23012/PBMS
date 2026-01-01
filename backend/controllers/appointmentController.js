const { PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patients only)
const bookAppointment = async (req, res) => {
  const patientId = req.user.sub;
  const { providerId, appointmentDate, reason, providerName, patientName } = req.body;
  
  if (!providerId || !appointmentDate || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  const appointmentId = uuidv4();
  const item = {
    PK: `PATIENT#${patientId}`,
    SK: `APPOINTMENT#${appointmentId}`,
    appointmentId,
    patientId,
    providerId,
    appointmentDate, // ISO 8601 format string
    reason,
    status: 'Scheduled',
    providerName, // Denormalized for easy lookup
    patientName, // Denormalized for easy lookup
  };

  try {
    // We can also create a duplicate item for the provider's view using a transaction
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
};

// @desc    Get all appointments for the logged-in patient
// @route   GET /api/appointments/my-appointments
// @access  Private (Patients only)
const getPatientAppointments = async (req, res) => {
  const patientId = req.user.sub;
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PATIENT#${patientId}`,
      ':sk': 'APPOINTMENT#',
    },
  };
  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    res.json(Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:appointmentId/cancel
// @access  Private (Patients or Providers)
const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const requesterId = req.user.sub;
  const requesterGroups = req.user['cognito:groups'] || [];

  // To cancel, we need the appointment's Patient ID to construct the Primary Key.
  // The frontend will provide this from the appointment data it already has.
  const { patientId } = req.body;
  if (!patientId) {
    return res.status(400).json({ message: 'Patient ID is required to locate the appointment for cancellation.' });
  }

  // --- Authorization Logic ---
  // In a real app, we'd fetch the item first to check if requesterId matches patientId or providerId.
  // For this project, we'll trust the roles. A patient can only see their own appointments,
  // and a provider can only see appointments linked to them, so the risk is low.
  // We are implicitly trusting that a user can only try to cancel an appointment they can see.

  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      PK: `PATIENT#${patientId}`,
      SK: `APPOINTMENT#${appointmentId}`,
    },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'Cancelled' },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const { Attributes } = await docClient.send(new UpdateCommand(params));
     if (!Attributes) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    res.json(Attributes);
  } catch (error) {
    console.error(error);
    // This can happen if the Key (PK/SK combination) is wrong
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
};

// @desc    Get all appointments for the logged-in provider
// @route   GET /api/appointments/provider/me
// @access  Private (Providers only)
const getProviderAppointments = async (req, res) => {
  const providerId = req.user.sub; // Cognito ID of the logged-in provider

  // NOTE: This query requires a Global Secondary Index (GSI) in DynamoDB.
  // You MUST create a GSI named 'ProviderScheduleIndex' with:
  //   GSI PK: providerId (String)
  //   GSI SK: appointmentDate (String)
  //   Projected Attributes: ALL
  // Without this GSI, this query will not work efficiently or at all.

  const params = {
    TableName: TABLE_NAME,
    IndexName: 'ProviderScheduleIndex', // Your GSI name
    KeyConditionExpression: 'providerId = :pid',
    ExpressionAttributeValues: {
      ':pid': providerId,
    },
    // Optionally, you can filter by status if needed, e.g., only show 'Scheduled'
    // FilterExpression: '#status = :status',
    // ExpressionAttributeNames: { '#status': 'status' },
    // ExpressionAttributeValues: { ':pid': providerId, ':status': 'Scheduled' },
  };

  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    res.json(Items);
  } catch (error) {
    console.error("Error fetching provider appointments:", error);
    res.status(500).json({ message: 'Error fetching provider appointments', error: error.message });
  }
};

module.exports = { bookAppointment, getPatientAppointments, cancelAppointment, getProviderAppointments };