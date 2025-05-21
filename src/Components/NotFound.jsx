import React from 'react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg mb-8">
        <svg viewBox="0 0 800 600" className="w-full">
          <circle cx="400" cy="300" r="150" fill="#e0e7ff" />
          <circle cx="400" cy="300" r="120" fill="#c7d2fe" />
          
          <circle cx="200" cy="150" r="4" fill="#6366f1" />
          <circle cx="300" cy="100" r="3" fill="#6366f1" />
          <circle cx="650" cy="200" r="5" fill="#6366f1" />
          <circle cx="700" cy="350" r="3" fill="#6366f1" />
          <circle cx="500" cy="150" r="4" fill="#6366f1" />
          <circle cx="150" cy="400" r="3" fill="#6366f1" />
          <circle cx="250" cy="500" r="5" fill="#6366f1" />
          <circle cx="600" cy="450" r="4" fill="#6366f1" />
          
          <circle cx="650" cy="150" r="50" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" />
          <ellipse cx="650" cy="150" rx="30" ry="48" fill="#93c5fd" fillOpacity="0.3" />
          
          <g transform="translate(350, 250)">
            <circle cx="50" cy="50" r="40" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="40" cy="40" r="5" fill="#0ea5e9" />
            
            <rect x="25" y="85" width="50" height="60" rx="20" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="3" />
            
            <line x1="25" y1="95" x2="0" y2="110" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
            <line x1="75" y1="95" x2="100" y2="110" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
            
            <line x1="35" y1="145" x2="25" y2="185" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
            <line x1="65" y1="145" x2="75" y2="185" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
            
            <animateTransform
              attributeName="transform"
              type="translate"
              values="350,250; 350,260; 350,250"
              dur="4s"
              repeatCount="indefinite"
            />
          </g>
          
          <g transform="translate(150, 200)">
            <rect x="0" y="0" width="40" height="15" fill="#94a3b8" />
            <rect x="15" y="-20" width="10" height="20" fill="#94a3b8" />
            <rect x="-30" y="5" width="30" height="5" fill="#0ea5e9" />
            <rect x="40" y="5" width="30" height="5" fill="#0ea5e9" />
            
            <animateTransform
              attributeName="transform"
              type="translate"
              values="150,200; 155,205; 150,200"
              dur="5s"
              repeatCount="indefinite"
            />
          </g>
        </svg>
      </div>
      
      <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-600 max-w-md text-center mb-8">
      We can't seem to find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <button 
          onClick={() => window.history.back()} 
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
        <a 
          href="/dashboard" 
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;