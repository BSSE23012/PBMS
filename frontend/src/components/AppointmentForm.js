// src/components/AppointmentForm.js
import React, { useState } from 'react';
import axios from 'axios';
import Notification from './Notifications';

const API_URL = 'http://pbhms-prod-alb-1122644307.us-east-1.elb.amazonaws.com:80/api/appointments';

function AppointmentForm({ patient }) {
  const [formData, setFormData] = useState({
    appointmentDate: '',
    reason: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification({ message: '', type: '' });

    const appointmentData = {
      ...formData,
      patientId: patient._id,
    };

    try {
      await axios.post(API_URL, appointmentData);
      setNotification({ message: 'Appointment booked successfully!', type: 'success' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book appointment.';
      setNotification({ message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Conditionally render a disabled state
  if (!patient) {
    return (
        <div className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-md mt-10 opacity-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-500">2. Book an Appointment</h2>
            <p className="text-center text-gray-600">Please register a patient first to book an appointment.</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">2. Book an Appointment</h2>
      <p className="mb-4 text-gray-600">Booking for: <span className="font-semibold">{patient.firstName} {patient.lastName}</span></p>
      <Notification message={notification.message} type={notification.type} />
      <form onSubmit={handleSubmit}>
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Appointment Date & Time</label>
            <input name="appointmentDate" type="datetime-local" onChange={handleChange} className="w-full p-3 mt-1 border rounded-md" required />
        </div>
        <textarea name="reason" onChange={handleChange} placeholder="Reason for appointment" rows="4" className="w-full p-3 mt-4 border rounded-md" required />
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white p-3 mt-6 rounded-md hover:bg-green-700 disabled:bg-gray-400">
          {isLoading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
}

export default AppointmentForm;