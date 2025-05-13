import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../../axiosInstance';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is Required');
    }
    if (!password) {
      setPasswordError('Password is Required');
    }

    if (!email || !password) {
      return;
    }

    setLoading(true);
    const response = await registerUserAPI(email, password);
    setLoading(false);

    if (response.success) {
      toast.success('Registration successful!');
      navigate('/Login');
    } else {
      toast.error(response.message || 'Error during registration!');
    }
  };

  const registerUserAPI = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', { email, password });

      if (response.data && response.data.success) {
        return { success: true };
      } else {
        return { success: false, message: response.data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, message: error.response?.data?.message || 'Network error. Please try again later.' };
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Create an Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full mt-1 p-3 border ${emailError ? 'border-red-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all`}
                />
                {emailError && <p className="text-sm text-red-600 mt-1">{emailError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full mt-1 p-3 border ${passwordError ? 'border-red-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all`}
                />
                {passwordError && <p className="text-sm text-red-600 mt-1">{passwordError}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <a href="/Login" className="text-indigo-600 hover:text-indigo-700">
              Sign In
            </a>
          </p>
        </div>
      </div>
      <Toaster />
    </>
  );
};