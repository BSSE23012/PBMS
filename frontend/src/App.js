// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import PatientForm from './components/PatientForm';
import AppointmentForm from './components/AppointmentForm';

function App() {
  // State to hold the newly registered patient's data
  const [registeredPatient, setRegisteredPatient] = useState(null);

  // This function will be called by the PatientForm upon successful registration
  const handlePatientRegistration = (patientData) => {
    setRegisteredPatient(patientData);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto p-8 flex flex-col items-center">
        {/* Patient Registration Form */}
        {!registeredPatient && (
            <PatientForm onPatientRegistered={handlePatientRegistration} />
        )}
        
        {/* Show a confirmation and the next step once registered */}
        {registeredPatient && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md w-full max-w-md">
                <p className="font-bold">Registration Complete!</p>
                <p>Patient <span className="font-semibold">{registeredPatient.firstName} {registeredPatient.lastName}</span> has been successfully registered.</p>
                <p className="mt-2">Please proceed to book an appointment below.</p>
            </div>
        )}

        {/* Appointment Booking Form */}
        <AppointmentForm patient={registeredPatient} />
      </main>
    </div>
  );
}

export default App;