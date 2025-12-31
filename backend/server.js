// // server.js
// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');

// // Import route files
// const patientRoutes = require('./routes/patientRoutes');
// const appointmentRoutes = require('./routes/appointmentRoutes');

// // Load environment variables from .env file
// dotenv.config();

// // Connect to the database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors()); // Enable Cross-Origin Resource Sharing
// app.use(express.json()); // To accept JSON data in the request body

// // A simple root route to test the server
// app.get('/', (req, res) => {
//   res.send('PBHMS API is running...');
// });

// // Mount routers
// app.use('/api/patients', patientRoutes);
// app.use('/api/appointments', appointmentRoutes);

// // Set the port from environment variables or default to 5000
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// NO MORE connectDB import or call

const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('PBHMS API is running...');
});

app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});