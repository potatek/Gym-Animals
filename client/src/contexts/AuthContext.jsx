import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  //token JWT
  const [token,   setToken]   = useState(() => localStorage.getItem('token'));
  const [user,    setUser]    = useState(() => JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

   
   useEffect(() => {
    const id = api.interceptors.request.use(config => {
      const t = localStorage.getItem('token');
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    return () => api.interceptors.request.eject(id);
  }, []); 

  const register = async (email, password) => {
    setLoading(true);
    const res = await api.post('/auth/register', { email, password });
    setToken(res.data.token);
    
    const payload = JSON.parse(atob(res.data.token.split('.')[1]));
    setUser({ userId: payload.userId, email: payload.email });
    setLoading(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
     setToken(res.data.token);
     const payload = JSON.parse(atob(res.data.token.split('.')[1]));
     setUser({ userId: payload.userId, email: payload.email, role: payload.role });
   } finally {
     setLoading(false);
   }
  };
  //wylogowanie usuwa token i dane klienta
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      register,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}
