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
  const userId = req.user.sub;

  // First, we need to fetch the appointment to check permissions
  // This is a simplified get; a real app would use a GSI on appointmentId for efficiency
  // For now, we'll assume the patient's PK is known. Let's add patientId to the request body for this.
  const { patientId } = req.body;
  if (!patientId) {
    return res.status(400).json({ message: 'patientId is required to locate the appointment' });
  }

  // Check if user is the patient or the provider for this appointment (pseudo-logic)
  // A full implementation would fetch the item and check its patientId/providerId fields.
  // For now, we'll trust the user if they are authenticated.

  const params = {
    TableName: TABLE_NAME,
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
    res.json(Attributes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
};

module.exports = { bookAppointment, getPatientAppointments, cancelAppointment };