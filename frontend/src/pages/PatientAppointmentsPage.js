// src/pages/PatientAppointmentsPage.js
import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';
import Spinner from '../components/Spinner';
import Notification from '../components/Notification'; // For errors

const API_URL = '/appointments'; // Use relative path now with apiService

function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  const fetchAppointments = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await api.get('/appointments/my-appointments');
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to fetch appointments.');
      console.error("Error fetching appointments:", err.response?.data?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const handleCancelAppointment = async (appointmentId, patientId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${appointmentId}/cancel`, { patientId });
      // After cancelling, re-fetch the list to show the updated status
      fetchAppointments(); 
    } catch (err) {
       alert("Failed to cancel appointment.");
       console.error(err);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary mb-6">My Appointments</h1>
      {error && <Notification message={error} type="error" />}
      {appointments.length === 0 ? (
        <p className="text-text-secondary">You have no upcoming appointments. <Link to="/providers" className="text-secondary hover:underline">Book one today!</Link></p>
      ) : (
        <div className="space-y-4">
          {appointments.map(app => (
            <div key={app.appointmentId} className="bg-base-100 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{app.providerName}</p>
                  <p className="text-text-secondary">{new Date(app.appointmentDate).toLocaleString()}</p>
                  <p className="mt-2">{app.reason}</p>
                </div>
                 {app.status === 'Scheduled' && (
                    <button onClick={() => handleCancelAppointment(app.appointmentId, app.patientId)} className="px-3 py-1 bg-red-600 text-white font-bold rounded text-sm hover:bg-red-700">Cancel</button>
                  )}
              </div>
              <p className="mt-2 font-semibold text-secondary">Status: {app.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientAppointmentsPage;