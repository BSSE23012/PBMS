// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

function HomePage() {
  const { isAuthenticated, userRole } = useAuth(); // Get auth status and role

  // --- Dynamic Button Logic ---
  let getStartedLink = '/providers'; // Default for logged-out users
  let getStartedText = 'Find a Doctor';

  if (isAuthenticated) {
    if (userRole === 'Patients') {
      getStartedLink = '/my-appointments';
      getStartedText = 'View My Appointments';
    } else if (userRole === 'Providers') {
      getStartedLink = '/dashboard';
      getStartedText = 'Go to My Dashboard';
    }
  }

  return (
    <div className="text-center py-10">
      <h1 className="text-5xl font-bold text-secondary mb-4 animate-fade-in-down">Welcome to HealthBooker</h1>
      <p className="text-lg text-text-secondary mb-8 animate-fade-in-up">Seamlessly book appointments and manage your health records.</p>
      <div>
        <Link 
          to={getStartedLink} 
          className="px-8 py-3 bg-secondary text-primary font-bold rounded-lg hover:bg-opacity-80 shadow-glow text-lg transform hover:scale-105 transition-transform duration-300"
        >
          {getStartedText}
        </Link>
      </div>
    </div>
  );
}

export default HomePage;