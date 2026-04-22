// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    navigate('/dashboard'); // Giriş başarılıysa dashboard'a yönlendir
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login'); // Çıkış yapınca logine yönlendir
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};