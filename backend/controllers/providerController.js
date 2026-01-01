// controllers/providerController.js

const { PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
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

module.exports = { upsertProviderProfile, getAllProviders };