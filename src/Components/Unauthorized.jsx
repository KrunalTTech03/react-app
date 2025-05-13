import React from 'react';
import { Lock, Shield, AlertTriangle, Users, Settings } from 'lucide-react';

function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 overflow-hidden relative">
      <div className="absolute top-10 left-10 w-40 h-16 bg-blue-100 rounded-full opacity-50"></div>
      <div className="absolute bottom-10 right-10 w-60 h-24 bg-blue-100 rounded-full opacity-50"></div>
      <div className="absolute top-1/4 right-10 w-20 h-20 bg-blue-100 rounded-full opacity-50"></div>
      
      <div className="absolute bottom-0 left-10 text-blue-200">
        <svg viewBox="0 0 100 100" className="w-32 h-32">
          <path d="M10,90 Q30,60 10,30 Q50,40 50,20 Q50,40 90,30 Q70,60 90,90" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-10 text-blue-200">
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          <path d="M10,90 Q30,40 10,10 Q50,30 50,10 Q50,30 90,10 Q70,40 90,90" fill="currentColor" />
        </svg>
      </div>
      
      <div className="w-full max-w-5xl mx-8 z-10 relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full mb-4">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="font-medium">401 Unauthorized</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Restricted by Admin</h1>
          <p className="text-gray-600 max-w-lg mx-auto">You don't have sufficient permissions to access this resource. Please contact your administrator for assistance.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-8 relative overflow-hidden">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48">
            <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-40 h-40 bg-blue-200 rounded-lg transform rotate-45 flex items-center justify-center">
                <div className="transform -rotate-45">
                  <Lock className="w-16 h-16 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 h-80 relative">
            <div className="flex flex-col items-center justify-end relative">
              <div className="w-full h-40 bg-blue-50 border border-blue-200 rounded-lg mb-6 relative overflow-hidden">
                <div className="absolute top-2 left-2 bg-blue-200 rounded-md p-1">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="pt-8 px-2">
                  <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="absolute bottom-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-blue-400"></div>
                </div>
              </div>
              
              <div className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-800"></div>
                  <div className="w-16 h-20 bg-blue-500 rounded-t-full mt-1"></div>
                  <div className="flex space-x-1 -mt-2">
                    <div className="w-5 h-12 bg-indigo-900 rounded-b-lg"></div>
                    <div className="w-5 h-12 bg-indigo-900 rounded-b-lg"></div>
                  </div>
                </div>
                <div className="absolute top-6 -left-4">
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-800"></div>
                  <div className="w-16 h-20 bg-gray-500 rounded-t-full mt-1"></div>
                  <div className="flex space-x-1 -mt-2">
                    <div className="w-5 h-12 bg-indigo-900 rounded-b-lg"></div>
                    <div className="w-5 h-12 bg-indigo-900 rounded-b-lg"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-end relative">
              <div className="w-full h-40 bg-blue-50 border border-blue-200 rounded-lg mb-6 relative overflow-hidden">
                <div className="absolute top-2 left-2 bg-blue-200 rounded-md p-1">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div className="pt-8 px-2 flex flex-wrap">
                  <div className="w-3 h-3 bg-red-300 rounded-full m-1"></div>
                  <div className="w-3 h-3 bg-yellow-300 rounded-full m-1"></div>
                  <div className="w-3 h-3 bg-green-300 rounded-full m-1"></div>
                  <div className="w-3 h-3 bg-blue-300 rounded-full m-1"></div>
                  <div className="w-3 h-3 bg-purple-300 rounded-full m-1"></div>
                  <div className="w-3 h-3 bg-red-300 rounded-full m-1"></div>
                  <div className="w-3 h-3 bg-yellow-300 rounded-full m-1"></div>
                  <div className="w-3 h-3 bg-green-300 rounded-full m-1"></div>
                  <div className="w-3 h-3 bg-blue-300 rounded-full m-1"></div>
                  
                  <div className="absolute top-14 left-4 w-10 h-1 bg-gray-300 transform rotate-45"></div>
                  <div className="absolute top-16 left-8 w-8 h-1 bg-gray-300 transform -rotate-30"></div>
                  <div className="absolute top-20 left-6 w-12 h-1 bg-gray-300 transform rotate-15"></div>
                </div>
              </div>
              
              <div className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-800"></div>
                  <div className="w-16 h-20 bg-blue-500 rounded-t-full mt-1"></div>
                  <div className="flex space-x-1 -mt-2">
                    <div className="w-5 h-12 bg-indigo-900 rounded-b-lg"></div>
                    <div className="w-5 h-12 bg-indigo-900 rounded-b-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;