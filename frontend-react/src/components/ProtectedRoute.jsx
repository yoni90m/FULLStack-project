import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — Wraps pages that require authentication.
 * Redirects to /login if the user is not authenticated.
 * Optionally restricts by role(s).
 *
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *   <Route path="/admin" element={<ProtectedRoute roles={['Admin']}><AdminPage /></ProtectedRoute>} />
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
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '60vh' }}>
        <h3 className="text-danger mb-3">🚫 Access Denied</h3>
        <p className="text-muted">You do not have permission to access this page.</p>
        <p className="text-muted small">Required role: {roles.join(', ')}</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
