// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, userRole, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <nav className="bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-secondary">
            HealthBooker
          </Link>
          <div className="flex items-center space-x-6">
            {userRole !== 'Providers' && (
              <Link to="/providers" className="text-text-secondary hover:text-secondary">Find a Doctor</Link>
            )}
            {isAuthenticated ? (
              <>
                {userRole === 'Patients' && (
                  <>
                    <Link to="/my-appointments" className="text-text-secondary hover:text-secondary">My Appointments</Link>
                    <Link to="/my-records" className="text-text-secondary hover:text-secondary">My Health Records</Link>
                  </>
                )}
                 {userRole === 'Providers' && (
                  <Link to="/dashboard" className="text-text-secondary hover:text-secondary">Provider Dashboard</Link>
                )}
                <span className="text-text-primary hidden md:block">Welcome, {user.given_name}</span>
                <button onClick={handleLogout} className="px-4 py-2 bg-secondary text-primary font-bold rounded hover:bg-opacity-80 shadow-glow">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-text-secondary hover:text-secondary">Sign In</Link>
                <Link to="/signup" className="px-4 py-2 bg-secondary text-primary font-bold rounded hover:bg-opacity-80 shadow-glow">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;