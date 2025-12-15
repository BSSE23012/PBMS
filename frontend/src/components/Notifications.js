// src/components/Notification.js
import React from 'react';

function Notification({ message, type }) {
  if (!message) {
    return null;
  }

  const baseStyle = 'p-4 rounded-md text-white my-4';
  const style = type === 'success' 
    ? `${baseStyle} bg-green-500` 
    : `${baseStyle} bg-red-500`;

  return (
    <div className={style}>
      <p>{message}</p>
    </div>
  );
}

export default Notification;