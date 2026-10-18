import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AccessDeniedPage = ({ requiredRoles = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <Card className="border-0 shadow-lg rounded-4 p-4 text-center bg-dark text-white" style={{ maxWidth: '520px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <Card.Body>
          <div className="mb-3" style={{ fontSize: '4rem' }}>
            🛡️
          </div>
          <h2 className="fw-bold text-danger mb-2">403 — Access Denied</h2>
          <p className="text-white-50 mb-3">
            You do not have permission to view this resource. Your current account role is <span className="badge bg-primary px-3 py-1 fs-6">{user?.role || 'Guest'}</span>.
          </p>

          {requiredRoles && requiredRoles.length > 0 && (
            <div className="p-3 mb-4 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 text-start">
              <div className="text-muted small fw-semibold text-uppercase">Role Authorization Required:</div>
              <div className="fw-bold text-danger-emphasis mt-1">
                {requiredRoles.join(' or ')}
              </div>
            </div>
          )}

          <div className="d-flex justify-content-center gap-3">
            <Button variant="outline-light" className="rounded-pill px-4" onClick={() => navigate(-1)}>
              &larr; Go Back
            </Button>
            <Button variant="primary" className="rounded-pill px-4" onClick={() => navigate('/dashboard')}>
              Go to My Dashboard
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AccessDeniedPage;
