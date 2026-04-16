import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      localStorage.removeItem('auth_user');
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (!user) {
          setUser(decoded);
        }
        localStorage.setItem('token', token);
      } catch (err) {
        console.error("Invalid token", err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user');
      }
    } else {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');
    }
  }, [token, user]);

  const login = (newToken, authUser) => {
    setToken(newToken);
    if (authUser) {
      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
