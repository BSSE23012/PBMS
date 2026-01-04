// src/pages/ProviderDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/apiService';
import Spinner from '../components/Spinner';
import BookingModal from '../components/BookingModal'; // We will create this
import { useAuth } from '../context/AuthContext';

function ProviderDetailPage() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        // Since we don't have a get-by-id endpoint, we fetch all and filter.
        const response = await api.get('/providers');
        const foundProvider = response.data.find(p => p.providerId === providerId);
        setProvider(foundProvider);
      } catch (error) {
        console.error("Failed to fetch provider details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProvider();
  }, [providerId]);

  if (isLoading) return <Spinner />;
  if (!provider) return <p>Provider not found.</p>;

  return (
    <>
      <div className="bg-base-100 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-secondary">{provider.given_name} {provider.family_name}</h1>
        <p className="text-xl text-text-secondary mt-1">{provider.specialty}</p>
        <p className="mt-4 text-text-primary text-lg">{provider.bio}</p>
        
        {isAuthenticated && userRole === 'Patients' && (
          <button onClick={() => setIsModalOpen(true)} className="mt-6 px-6 py-3 bg-secondary text-primary font-bold rounded-lg hover:bg-opacity-80 shadow-glow text-lg">
            Book an Appointment
          </button>
        )}
      </div>

      {isModalOpen && (
        <BookingModal 
          provider={provider} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}

export default ProviderDetailPage;