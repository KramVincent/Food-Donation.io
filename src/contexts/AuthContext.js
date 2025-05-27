import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

// Simple JWT decode function
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authTokens, setAuthTokens] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/profile/');
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.response?.data?.message || 'Failed to fetch user data');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, password });
      const response = await api.post('/api/auth/token/', {
        email,
        password
      });
      console.log('Login response:', response.data);
      
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        setAuthTokens(response.data);
        setUser(decodeJWT(response.data.access));
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.detail?.[0] || 'Login failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Sending registration data:', userData);
      const response = await api.post('/api/auth/register/', {
        username: userData.email,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirm_password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number || ''
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setAuthTokens(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile/update/', profileData);
      setUser(response.data);
      return { success: true };
    } catch (err) {
      console.error('Profile update error:', err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to update profile',
      };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await api.post('/api/auth/password-reset/', { email });
      return { success: true };
    } catch (err) {
      console.error('Password reset request error:', err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to request password reset',
      };
    }
  };

  const resetPassword = async (uidb64, token, newPassword) => {
    try {
      await api.post(`/api/auth/password-reset/${uidb64}/${token}/`, {
        password: newPassword,
      });
      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to reset password',
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await api.post(`/api/auth/verify-email/${token}/`);
      await fetchUser();
      return { success: true };
    } catch (err) {
      console.error('Email verification error:', err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to verify email',
      };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 