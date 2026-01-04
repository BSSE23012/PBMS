// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import {jwtDecode} from 'jwt-decode';
import { signOut } from '../services/cognitoService';
import api from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        // Check if token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          setToken(storedToken);
        } else {
          localStorage.removeItem('userToken');
        }
      } catch (error) {
        localStorage.removeItem('userToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem('userToken', newToken);
    const decodedUser = jwtDecode(newToken);
    setUser(decodedUser);
    setToken(newToken);

    if (decodedUser['cognito:groups']?.[0] === 'Patients') {
      try {
        api.post('/users/profile'); // No need to await or handle response here
      } catch (error) {
        console.error("Failed to ensure patient profile exists", error);
      }
    }
  };

  const logout = () => {
    signOut(); // From cognitoService
    localStorage.removeItem('userToken');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    userRole: user ? user['cognito:groups']?.[0] : null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};