// src/pages/PatientHealthRecordsPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';
import Spinner from '../components/Spinner';
import Notification from '../components/Notification';

function PatientHealthRecordsPage() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        // CORRECTED: This is the endpoint for a patient to get their own records.
        const response = await api.get('/health-records/my-records');
        setRecords(response.data);
      } catch (error) {
        console.error("Failed to fetch health records", error);
        setError("Could not load your health records. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [user]); // Depend on user object to re-fetch on login

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary mb-6">My Health Records</h1>
      {error && <Notification message={error} type="error" />}
      {records.length === 0 && !isLoading ? (
        <p className="text-text-secondary">No health records found.</p>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <div key={record.recordId} className="bg-base-100 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-lg text-secondary">{record.recordType}</p>
                <p className="text-sm text-text-secondary">{new Date(record.dateRecorded).toLocaleDateString()}</p>
              </div>
              <pre className="mt-2 text-sm bg-primary p-3 rounded whitespace-pre-wrap border border-gray-700">
                Details: {JSON.stringify(record.details, null, 2)}
              </pre>
              {record.providerNotes && (
                <div className="mt-3 p-3 bg-primary rounded border border-gray-700">
                  <p className="font-semibold text-text-secondary">Provider Notes:</p>
                  <p className="text-text-primary">{record.providerNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientHealthRecordsPage;