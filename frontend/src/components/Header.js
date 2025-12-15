// src/components/Header.js
import React from 'react';

function Header() {
  return (
    <header className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white">
          Patient Booking & Health Management System
        </h1>
      </div>
    </header>
  );
}

export default Header;