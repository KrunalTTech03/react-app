import React from 'react'

const MimicLogin = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-gray-900/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-100">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="rounded-full bg-gray-100 p-4">
            <div className="text-gray-400 w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          
          <p className="text-gray-700 text-lg font-medium">
            Are you sure you want to Mimic this user?
          </p>
          
          <div className="flex w-full justify-center space-x-4 pt-4">
            <button
              className="py-2 px-4 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors w-32"
              onClick={onConfirm}
            >
              Yes, I'm sure
            </button>
            <button
              className="py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors w-32"
              onClick={onClose}
            >
              No, cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MimicLogin