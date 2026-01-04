// src/pages/UnauthorizedPage.js
import React from 'react';

function UnauthorizedPage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-500">Access Denied</h1>
      <p className="mt-4">You do not have permission to view this page.</p>
    </div>
  );
}
export default UnauthorizedPage;