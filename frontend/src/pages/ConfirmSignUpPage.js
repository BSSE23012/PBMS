// src/pages/ConfirmSignUpPage.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmSignUp } from '../services/cognitoService';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import api from '../services/apiService';

function ConfirmSignUpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {}; // Get email passed from SignUpPage
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!email) {
    // If no email is passed, redirect to signup
    return <Notification message="Please sign up first." type="error" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await confirmSignUp(email, code);
      await api.post('/users/assign-patient-group', { email });
      setSuccess('Confirmation successful! You can now sign in.');
      // Navigate to sign-in after a short delay
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-base-100 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-secondary">Confirm Your Account</h2>
        <p className="text-center text-text-secondary">A confirmation code has been sent to <strong>{email}</strong>.</p>
        <Notification message={error} type="error" />
        <Notification message={success} type="success" />
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Confirmation Code" required className="w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary" />
          <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-bold text-primary bg-secondary rounded-md hover:bg-opacity-80 disabled:bg-gray-500 shadow-glow">
            {isLoading ? 'Confirming...' : 'Confirm'}
          </button>
        </form>
         <p className="text-sm text-center text-text-secondary">
          Didn't get the code? Resend is not implemented yet.
        </p>
      </div>
    </div>
  );
}

export default ConfirmSignUpPage;