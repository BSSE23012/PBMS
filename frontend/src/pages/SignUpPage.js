// src/pages/SignUpPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../services/cognitoService';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner'; // Assuming you have this component

function SignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await signUp(email, password, firstName, lastName);
      setSuccess('Sign up successful! Please check your email for the confirmation code.');
      // After success, navigate to the confirmation page, passing the email
      navigate('/confirm-signup', { state: { email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-base-100 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-secondary">Create an Account</h2>
        <Notification message={error} type="error" />
        <Notification message={success} type="success" />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex space-x-4">
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required className="w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary" />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required className="w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary" />
          </div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary" />
          
          <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-bold text-primary bg-secondary rounded-md hover:bg-opacity-80 disabled:bg-gray-500 shadow-glow">
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center text-text-secondary">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-secondary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;