// src/pages/ProviderDashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/apiService';
import Spinner from '../components/Spinner';
import Notification from '../components/Notification';
import ProfileModal from '../components/ProfileModal';

function ProviderDashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // THIS IS THE CRITICAL LOGIC THAT WAS MISSING
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments and patients concurrently for better performance
        const [appointmentsResponse, patientsResponse] = await Promise.all([
          api.get('/appointments/provider/me'),
          api.get('/providers/my-patients') // <-- FETCH FROM NEW ENDPOINT
        ]);
        setAppointments(appointmentsResponse.data);
        setPatients(patientsResponse.data); // <-- SET THE PATIENTS STATE
      } catch (error) {
        console.error("Failed to fetch provider dashboard data", error);
        setError('Failed to load dashboard data. Please ensure your Provider profile is created.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // Empty dependency array means this runs only once on mount

  const handleCancelAppointment = async (appointmentId, patientId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${appointmentId}/cancel`, { patientId });
      setAppointments(prev => prev.map(app =>
        app.appointmentId === appointmentId ? { ...app, status: 'Cancelled' } : app
      ));
    } catch (err) {
      alert("Failed to cancel appointment.");
      console.error(err);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Provider Dashboard</h1>
        <button onClick={() => setIsProfileModalOpen(true)} className="px-4 py-2 bg-secondary text-primary font-bold rounded hover:bg-opacity-80 shadow-glow">
          Manage My Profile
        </button>
      </div>

      {error && <Notification message={error} type="error" />}

      {/* --- MY PATIENTS SECTION (NEW) --- */}
      <h2 className="text-2xl font-bold text-text-primary mb-4 mt-8">My Patients</h2>
      {patients.length === 0 && !isLoading ? (
        <p className="text-text-secondary">You have no patients yet. Patients will appear here after you have an appointment with them.</p>
      ) : (
        <div className="bg-base-100 p-6 rounded-lg shadow-lg">
          <ul className="space-y-3">
            {patients.map(patient => (
              <li key={patient.patientId} className="flex justify-between items-center">
                <span className="text-lg">{patient.patientName}</span>
                <Link to={`/patient/${patient.patientId}/records`} className="px-4 py-2 bg-secondary text-primary font-bold rounded hover:bg-opacity-80 text-sm">
                    View Records
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

    {/* --- APPOINTMENTS SECTION (EXISTING) --- */}
      <h2 className="text-2xl font-bold text-text-primary mb-4">Upcoming Appointments</h2>
      {appointments.length === 0 && !isLoading ? (
        <p className="text-text-secondary">You have no upcoming appointments.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map(app => (
            <div key={app.appointmentId} className="bg-base-100 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{app.patientName}</p>
                  <p className="text-sm text-text-secondary">{new Date(app.appointmentDate).toLocaleString()}</p>
                  <p className="mt-1">{app.reason}</p>
                </div>
                <div className="flex items-center space-x-4">
                  {app.status === 'Scheduled' && (
                     <button onClick={() => handleCancelAppointment(app.appointmentId, app.patientId)} className="text-sm text-red-400 hover:underline">Cancel</button>
                  )}
                  <Link to={`/patient/${app.patientId}/records`} className="px-4 py-2 bg-secondary text-primary font-bold rounded hover:bg-opacity-80">
                    View Records
                  </Link>
                </div>
              </div>
               <p className="mt-2 font-semibold text-secondary">Status: {app.status}</p>
            </div>
          ))}
        </div>
      )}

      {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
    </>
  );
}

export default ProviderDashboardPage;