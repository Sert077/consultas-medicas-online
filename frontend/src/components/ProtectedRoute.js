// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../utils/jwtUtils';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token || !isTokenValid(token)) {
    // Si el token no existe o está expirado, redirige a login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
