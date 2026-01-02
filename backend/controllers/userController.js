// controllers/userController.js
const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } = require("@aws-sdk/client-cognito-identity-provider");

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

module.exports = { assignPatientGroup };