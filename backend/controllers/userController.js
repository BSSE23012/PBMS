// controllers/userController.js
const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../config/db');
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const region = process.env.AWS_REGION || 'us-east-1';
const userPoolId = process.env.COGNITO_USER_POOL_ID;

const cognitoClient = new CognitoIdentityProviderClient({ region });

// @desc    Assigns a newly confirmed user to the Patients group
// @route   POST /api/users/assign-patient-group
// @access  Public (called immediately after confirmation)
const assignPatientGroup = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const params = {
    GroupName: 'Patients', // The group you want to add the user to
    UserPoolId: userPoolId,
    Username: email, // For Cognito, the username is the email
  };

  try {
    const command = new AdminAddUserToGroupCommand(params);
    await cognitoClient.send(command);
    console.log(`Successfully added user ${email} to Patients group.`);
    res.status(200).json({ message: 'User successfully assigned to Patients group.' });
  } catch (error) {
    console.error(`Error adding user ${email} to group:`, error);
    res.status(500).json({ message: 'Failed to assign user to group.', error: error.message });
  }
};

// @desc    Create a patient's profile metadata if it doesn't exist
// @route   POST /api/users/profile
// @access  Private (Patients only)
const createPatientProfile = async (req, res) => {
  // User details are from the validated JWT token
  const { sub, given_name, family_name, email } = req.user;

  const item = {
    PK: `PATIENT#${sub}`,
    SK: 'METADATA',
    userId: sub,
    userType: 'PATIENT',
    given_name,
    family_name,
    email,
    createdAt: new Date().toISOString(),
  };

  const params = {
    TableName: TABLE_NAME,
    Item: item,
    // This is the key: it prevents overwriting an existing profile.
    // The Put operation will only succeed if an item with this PK does not already exist.
    ConditionExpression: 'attribute_not_exists(PK)',
  };

  try {
    await docClient.send(new PutCommand(params));
    console.log(`Successfully created metadata for patient ${sub}.`);
    res.status(201).json(item);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      // This is not an error, it just means the profile already exists.
      return res.status(200).json({ message: 'Profile already exists.' });
    }
    console.error(`Error creating patient profile for ${sub}:`, error);
    res.status(500).json({ message: 'Error creating patient profile', error: error.message });
  }
};


module.exports = { 
  assignPatientGroup,
  createPatientProfile,
}