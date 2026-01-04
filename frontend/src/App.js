// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import UnauthorizedPage from './pages/UnauthorizedPage';
import Spinner from './components/Spinner';

import HomePage from './pages/Homepage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ConfirmSignUpPage from './pages/ConfirmSignUpPage';

import PatientAppointmentsPage from './pages/PatientAppointmentsPage';
import PatientHealthRecordsPage from './pages/PatientHealthRecordsPage';
import PatientMedicalHistoryPage from './pages/PatientMedicalHistoryPage';

import ProviderDashboardPage from './pages/ProviderDashboardPage';
import ProvidersListPage from './pages/ProvidersListPage';
import ProviderDetailPage from './pages/ProviderDetailPage';

function App() {
  const { isLoading } = useAuth();

  // Show a global spinner while the auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <Spinner />
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="signin" element={<SignInPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="confirm-signup" element={<ConfirmSignUpPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />
          <Route path="providers" element={<ProvidersListPage />} />
          <Route path="providers/:providerId" element={<ProviderDetailPage />} />

          {/* Patient Routes */}
          <Route path="my-appointments" element={<ProtectedRoute allowedRoles={['Patients']}><PatientAppointmentsPage /></ProtectedRoute>} />
          <Route path="my-records" element={<ProtectedRoute allowedRoles={['Patients']}><PatientHealthRecordsPage /></ProtectedRoute>} />

          {/* Provider Routes */}
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['Providers']}><ProviderDashboardPage /></ProtectedRoute>} />
          <Route path="patient/:patientId/records" element={<ProtectedRoute allowedRoles={['Providers']}><PatientMedicalHistoryPage /></ProtectedRoute>} />

          {/* Catch-all for 404 */}
          <Route path="*" element={<div className="text-center p-12"><h1 className="text-3xl text-secondary">404: Page Not Found</h1></div>} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;