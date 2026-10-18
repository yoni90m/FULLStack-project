import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <Card className="border-0 shadow-lg rounded-4 p-4 text-center bg-dark text-white" style={{ maxWidth: '520px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <Card.Body>
          <div className="mb-3" style={{ fontSize: '4rem' }}>
            🚍💨
          </div>
          <h1 className="fw-bold text-info display-4 mb-2">404</h1>
          <h4 className="fw-bold text-white mb-2">Page Not Found</h4>
          <p className="text-white-50 mb-4">
            The page or transit corridor you are searching for does not exist or has been moved.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="outline-light" className="rounded-pill px-4" onClick={() => navigate(-1)}>
              &larr; Go Back
            </Button>
            <Button variant="info" className="rounded-pill px-4 fw-semibold text-dark" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NotFoundPage;
