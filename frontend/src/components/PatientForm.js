// src/components/PatientForm.js
import React, { useState } from 'react';
import axios from 'axios';
import Notification from './Notifications';

// The base URL for our backend API
const API_URL = 'http://localhost:5001/api/patients';

function PatientForm({ onPatientRegistered }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
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

    try {
      const response = await axios.post(API_URL, formData);
      setNotification({ message: 'Patient registered successfully!', type: 'success' });
      onPatientRegistered(response.data); // Pass the new patient data to the parent
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to register patient.';
      setNotification({ message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">1. Register as a New Patient</h2>
      <Notification message={notification.message} type={notification.type} />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="firstName" onChange={handleChange} placeholder="First Name" className="p-3 border rounded-md" required />
          <input name="lastName" onChange={handleChange} placeholder="Last Name" className="p-3 border rounded-md" required />
        </div>
        <input name="email" type="email" onChange={handleChange} placeholder="Email Address" className="w-full p-3 mt-4 border rounded-md" required />
        <input name="phone" onChange={handleChange} placeholder="Phone Number" className="w-full p-3 mt-4 border rounded-md" required />
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input name="dateOfBirth" type="date" onChange={handleChange} className="w-full p-3 mt-1 border rounded-md" required />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white p-3 mt-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {isLoading ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
    </div>
  );
}

export default PatientForm;