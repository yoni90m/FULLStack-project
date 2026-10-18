import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccessDeniedPage from '../pages/AccessDeniedPage';

/**
 * ProtectedRoute — Wraps pages that require authentication.
 * Redirects to /login if the user is not authenticated.
 * Optionally restricts by role(s).
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <AccessDeniedPage requiredRoles={roles} />;
  }

  return children;
};

export default ProtectedRoute;
