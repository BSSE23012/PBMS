const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const { protect } = require('./middleware/authMiddleware'); // For a test route

// Load environment variables


// Import route files
const providerRoutes = require('./routes/providerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const healthRecordRoutes = require('./routes/healthRecordRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// A simple root route
app.get('/', (req, res) => {
  res.send('PBHMS API is running...');
});

// A protected test route to check token authentication
app.get('/api/test', protect, (req, res) => {
    res.json({
        message: 'You have accessed a protected route!',
        user: req.user
    });
});

// Mount routers
app.use('/api/providers', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/health-records', healthRecordRoutes);

// Set the port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});