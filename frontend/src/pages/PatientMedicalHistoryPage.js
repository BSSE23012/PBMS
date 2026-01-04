// src/pages/PatientMedicalHistoryPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/apiService';
import Spinner from '../components/Spinner';
import Notification from '../components/Notification';
import { useAuth } from '../context/AuthContext';

// Helper component for form (can be moved to components/ dir)
function AddRecordForm({ patientId, onRecordAdded }) {
  const [recordType, setRecordType] = useState('DIAGNOSIS');
  const [details, setDetails] = useState('');
  const [providerNotes, setProviderNotes] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    let parsedDetails = {};
    if (details) {
        try {
            parsedDetails = JSON.parse(details);
        } catch (err) {
            setError('Invalid JSON format for details.');
            setIsLoading(false);
            return;
        }
    }

    try {
      const recordData = { patientId, recordType, details: parsedDetails, providerNotes };
      await api.post('/health-records', recordData);
      setSuccess('Health record added successfully!');
      setRecordType('DIAGNOSIS');
      setDetails('');
      setProviderNotes('');
      onRecordAdded(); // Refresh the list of records
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add health record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg mt-8">
      <h3 className="text-xl font-bold text-secondary mb-4">Add New Health Record</h3>
      <Notification message={error} type="error" />
      <Notification message={success} type="success" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recordType" className="block text-sm font-medium text-text-secondary">Record Type</label>
          <select id="recordType" value={recordType} onChange={e => setRecordType(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary">
            <option value="DIAGNOSIS">Diagnosis</option>
            <option value="MEDICATION">Medication</option>
            <option value="ALLERGY">Allergy</option>
            <option value="VITALS">Vitals</option>
            <option value="CONSULTATION_NOTE">Consultation Note</option>
          </select>
        </div>
        <div>
          <label htmlFor="details" className="block text-sm font-medium text-text-secondary">Details (JSON format, e.g., "name": "Lisinopril", "dosage": "10mg")</label>
          <textarea id="details" rows="3" value={details} onChange={e => setDetails(e.target.value)} placeholder='{"condition": "Hypertension"}' required className="mt-1 w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary"></textarea>
        </div>
        <div>
          <label htmlFor="providerNotes" className="block text-sm font-medium text-text-secondary">Provider Notes (Optional)</label>
          <textarea id="providerNotes" rows="3" value={providerNotes} onChange={e => setProviderNotes(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-md bg-primary border-gray-600 focus:ring-secondary focus:border-secondary"></textarea>
        </div>
        <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-bold text-primary bg-secondary rounded-md hover:bg-opacity-80 disabled:bg-gray-500 shadow-glow">
          {isLoading ? 'Adding...' : 'Add Record'}
        </button>
      </form>
    </div>
  );
}


function PatientMedicalHistoryPage() {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState(null); // To display patient name
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      let response;
      if (userRole === 'Providers') {
        // Provider viewing another patient's records
        response = await api.get(`/health-records/patient/${patientId}`);
        // Attempt to get patient name (from provider dashboard query)
        const patientResponse = await api.get(`/providers/patient/${patientId}`); // Needs backend endpoint
        setPatient(patientResponse.data);
      } else if (userRole === 'Patients' && user.sub === patientId) {
        // Patient viewing their own records
        response = await api.get('/health-records/my-records');
        setPatient({ given_name: user.given_name, family_name: user.family_name });
      } else {
        // Unauthorized access attempt
        navigate('/unauthorized');
        return;
      }
      setRecords(response.data);
    } catch (error) {
      console.error("Failed to fetch health records", error);
      // Handle unauthorized errors specifically
      if (error.response && error.response.status === 403) {
        navigate('/unauthorized');
      } else {
        // Generic error
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId, userRole, user?.sub, navigate]); // Re-fetch if patient ID or user role changes

  // --- Render Logic ---
  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary mb-6">
        Medical History For {patient?.given_name ? `${patient.given_name} ${patient.family_name}` : `Patient ${patientId}`}
      </h1>
      {records.length === 0 ? (
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

      {/* Only providers can add records */}
      {userRole === 'Providers' && (
        <AddRecordForm patientId={patientId} onRecordAdded={fetchRecords} />
      )}
    </div>
  );
}

export default PatientMedicalHistoryPage;