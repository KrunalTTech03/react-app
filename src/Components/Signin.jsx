import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import axiosInstance from '../../axiosInstance';
import { Loader } from '../components/Loader';

export const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');

    if (!email && !password) {
      setEmailError('Email is Required');
      setPasswordError('Password is Required');
      return;
    }

    if (!email) {
      setEmailError('Please enter your email!');
      return;
    }

    if (!password) {
      setPasswordError('Please enter your password!');
      return;
    }

    setLoading(true);
    const response = await loginUserAPI(email, password);
    setLoading(false);

    if (response.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(response.message || 'Invalid email or password!');
    }
  };

  const loginUserAPI = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });

      if (response.data && response.data.success) {
        // Store token
        localStorage.setItem('authToken', response.data.data.token);
        console.log('Token saved:', response.data.data.token);
        
        // Store role
        localStorage.setItem('Role_Name', response.data.data.role_Name);
        console.log('Role saved:', response.data.data.role_Name);
        
        // Store user ID
        localStorage.setItem('userId', response.data.data.id);
        console.log('Id saved:', response.data.data.id);
        
        // Store permissions
        if (response.data.data.permissions && Array.isArray(response.data.data.permissions)) {
          // Store all permissions as a JSON string
          localStorage.setItem('userPermissions', JSON.stringify(response.data.data.permissions));
          console.log('Permissions saved:', response.data.data.permissions);
        }
        
        return { success: true };
      } else {
        console.error('Login failed:', response.data.message || 'Invalid credentials');
        return { success: false, message: response.data.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: error.response?.data?.message || 'Network error. Please try again later.' };
    }
  };  

  return (
    <>
      {loading && <Loader />}
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="grid grid-cols-1 gap-4">
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
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <a href="/" className="text-indigo-600 hover:text-indigo-700">
              Signup
            </a>
          </p>
        </div>
      </div>
      <Toaster />
    </>
  );
};