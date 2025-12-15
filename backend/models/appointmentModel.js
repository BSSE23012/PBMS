// models/appointmentModel.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient', // This creates a reference to the Patient model
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date and time are required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Scheduled', 'Completed', 'Cancelled'], // Pre-defined valid statuses
      default: 'Scheduled',
    },
    // We can add a doctorId reference here as well
    // doctorId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: 'Doctor',
    // }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);