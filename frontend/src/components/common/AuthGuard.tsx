import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBackendStatus } from '../../context/BackendStatusContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { authToken } = useBackendStatus();
  const location = useLocation();

  if (!authToken) {
    // Redirect to login while preserving the attempted path in location state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
