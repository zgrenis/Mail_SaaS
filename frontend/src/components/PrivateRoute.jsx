// src/components/PrivateRoute.jsx
// Korumalı sayfalara giriş kontrolü için kullan
// Örnek: <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsAuthenticated } from '../store/authSlice';

export default function PrivateRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}