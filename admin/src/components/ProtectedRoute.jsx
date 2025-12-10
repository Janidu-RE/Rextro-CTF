import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/ctf-admin-portal" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'super_admin':
        return <Navigate to="/super-admin" replace />;
      case 'player_manager':
        return <Navigate to="/player-manager" replace />;
      case 'round_manager':
        return <Navigate to="/round-manager" replace />;
      default:
        return <Navigate to="/ctf-admin-portal" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;