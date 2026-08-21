import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('silverhands_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('[Auth Error] Token invalid or expired:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const newToken = res.data.token;
      const newUser = res.data.user;
      localStorage.setItem('silverhands_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const newToken = res.data.token;
      const newUser = res.data.user;
      localStorage.setItem('silverhands_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('silverhands_token');
    setToken(null);
    setUser(null);
  };

  /**
   * Merge updated fields into the in-memory user object.
   * Call this after any profile/onboarding save so the rest of the
   * app (Dashboard, Navbar, LocationMapModal, etc.) sees fresh data
   * without requiring a full page reload.
   *
   * @param {Object} updatedFields - Partial user fields to merge (e.g. { location: {...} })
   */
  const updateUser = (updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : prev);
  };

  /**
   * Re-fetch the full user from the server and replace the in-memory user.
   * Use this when you need to guarantee the context is in sync with the DB.
   */
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('[Auth] refreshUser failed:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated: !!user
      }}
    >
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
