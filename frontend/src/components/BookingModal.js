// src/components/BookingModal.js
import React, { useState } from 'react';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import Notification from './Notification';

function BookingModal({ provider, onClose }) {
  const [appointmentDate, setAppointmentDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const appointmentData = {
        providerId: provider.providerId,
        providerName: `${provider.given_name} ${provider.family_name}`,
        patientName: `${user.given_name} ${user.family_name}`,
        appointmentDate,
        reason,
      };
      await api.post('/appointments', appointmentData);
      setSuccess('Appointment booked successfully!');
      setTimeout(() => onClose(), 2000); // Close modal after 2 seconds
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-base-100 p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-secondary mb-4">Book with {provider.given_name} {provider.family_name}</h2>
        <Notification message={error} type="error" />
        <Notification message={success} type="success" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-text-secondary">Date and Time</label>
            <input type="datetime-local" id="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required className="mt-1 w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary" />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-text-secondary">Reason for Visit</label>
            <textarea id="reason" rows="3" value={reason} onChange={e => setReason(e.target.value)} required className="mt-1 w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary"></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-secondary text-primary font-bold rounded hover:bg-opacity-80 disabled:bg-gray-500 shadow-glow">
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;