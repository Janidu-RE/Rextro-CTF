import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken } from '../../../backend/src/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('ctf_user');
    const token = localStorage.getItem('ctf_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setAuthToken(token);
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    
    try {
      const { token, user: userData } = await authAPI.login(username, password);
      
      setUser(userData);
      setAuthToken(token);
      
      localStorage.setItem('ctf_token', token);
      localStorage.setItem('ctf_user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('ctf_token');
    localStorage.removeItem('ctf_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};