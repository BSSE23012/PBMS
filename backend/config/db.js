// // config/db.js
// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error connecting to MongoDB: ${error.message}`);
//     process.exit(1); // Exit process with failure
//   }
// };

// module.exports = connectDB;

// config/db.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// The AWS Region can be configured via environment variables or will default to us-east-1
const region = process.env.AWS_REGION || 'us-east-1';

// Create a standard DynamoDB client
const client = new DynamoDBClient({ region });

// Create the DynamoDB Document Client, which makes working with JS objects easier
const docClient = DynamoDBDocumentClient.from(client);

// Export the document client for use in our controllers
module.exports = { docClient };