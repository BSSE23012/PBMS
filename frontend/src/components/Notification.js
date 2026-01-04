// src/components/Notification.js
import React from 'react';

function Notification({ message, type }) {
  if (!message) return null;

  const style = type === 'success'
    ? 'bg-green-100 border-green-500 text-green-700'
    : 'bg-red-100 border-red-500 text-red-700';

  return (
    <div className={`border-l-4 p-4 my-4 ${style}`} role="alert">
      <p>{message}</p>
    </div>
  );
}

export default Notification;