// src/pages/ProvidersListPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/apiService';
import Spinner from '../components/Spinner';

function ProvidersListPage() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await api.get('/providers');
        setProviders(response.data);
      } catch (error) {
        console.error("Failed to fetch providers", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary mb-6">Find Your Doctor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(provider => (
          <Link to={`/providers/${provider.providerId}`} key={provider.providerId} className="block bg-base-100 p-6 rounded-lg shadow-lg hover:shadow-glow transition-shadow duration-300">
            <h2 className="text-xl font-bold text-secondary">{provider.given_name} {provider.family_name}</h2>
            <p className="text-text-secondary">{provider.specialty}</p>
            <p className="mt-2 text-text-primary truncate">{provider.bio}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProvidersListPage;