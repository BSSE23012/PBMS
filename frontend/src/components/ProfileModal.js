// src/components/ProfileModal.js
import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import Notification from './Notification';

function ProfileModal({ onClose }) {
  const [profile, setProfile] = useState({ given_name: '', family_name: '', specialty: '', bio: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Pre-fill form with existing data if available
    setProfile({
      given_name: user?.given_name || '',
      family_name: user?.family_name || '',
      specialty: user?.specialty || '', // Custom attributes need to be fetched
      bio: user?.bio || ''
    });
    // In a real app, you would fetch the full profile from your DB here
  }, [user]);
  
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/providers/profile', profile);
      setSuccess('Profile updated successfully!');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-base-100 p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-secondary mb-4">Manage Your Profile</h2>
        <Notification message={error} type="error" />
        <Notification message={success} type="success" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <input name="given_name" value={profile.given_name} onChange={handleChange} placeholder="First Name" required className="w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary" />
            <input name="family_name" value={profile.family_name} onChange={handleChange} placeholder="Last Name" required className="w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary" />
          </div>
          <input name="specialty" value={profile.specialty} onChange={handleChange} placeholder="Specialty (e.g., Cardiology)" required className="w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary" />
          <textarea name="bio" rows="4" value={profile.bio} onChange={handleChange} placeholder="A short bio about your professional background." required className="w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary"></textarea>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-secondary text-primary font-bold rounded hover:bg-opacity-80 disabled:bg-gray-500 shadow-glow">
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;