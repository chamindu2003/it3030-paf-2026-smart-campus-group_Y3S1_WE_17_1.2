import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 *
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;

