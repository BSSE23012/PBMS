// src/components/Dashboard.js
import React from 'react';
import { signOut } from '../services/cognitoService';

function Dashboard({ user, onSignOut }) {

  const handleSignOut = () => {
    signOut();
    onSignOut();
  };

  return (
    <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Welcome!</h2>
        <button onClick={handleSignOut} className="px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700">
          Sign Out
        </button>
      </div>
      <p>You have successfully logged in.</p>
      <div className="p-4 mt-4 bg-gray-100 rounded-md">
        <h3 className="font-semibold">Your User Info (from token):</h3>
        <pre className="mt-2 text-sm whitespace-pre-wrap break-all">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <p className="text-sm text-gray-600">Your user group is: <strong>{user['cognito:groups']?.[0] || 'Not assigned'}</strong></p>
    </div>
  );
}

export default Dashboard;