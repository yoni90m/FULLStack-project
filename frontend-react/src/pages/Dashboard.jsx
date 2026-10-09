import React from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LiveVehicleMap from '../components/LiveVehicleMap';
import './Dashboard.css';
import heroBus from '../assets/hero_bus.jpg';

const Dashboard = () => {
  return (
    <Container fluid className="dashboard-container p-4">
      <Row className="mb-4">
        <Col>
          <div className="welcome-banner p-4 rounded-4 text-white shadow-lg d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold">Welcome back, Admin! 👋</h2>
              <p className="mb-0 text-white-50">Here is what's happening with your transit operations today.</p>
            </div>
            <div className="d-none d-sm-block text-center z-1">
              <Image 
                src={heroBus} 
                alt="Bus Driver" 
                roundedCircle 
                className="shadow-sm"
                style={{ width: '130px', height: '130px', objectFit: 'cover', border: '4px solid rgba(255, 255, 255, 0.3)' }}
              />
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card border-0 shadow-sm h-100 rounded-4">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 p-3 fs-4">
                🚍
              </div>
              <div>
                <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.8rem' }}>Total Buses</div>
                <h3 className="fw-bold mb-0">24</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card border-0 shadow-sm h-100 rounded-4">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-success bg-opacity-10 text-success rounded-3 p-3 fs-4">
                🎫
              </div>
              <div>
                <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.8rem' }}>Active Bookings</div>
                <h3 className="fw-bold mb-0">156</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card border-0 shadow-sm h-100 rounded-4">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-warning bg-opacity-10 text-warning rounded-3 p-3 fs-4">
                🗺️
              </div>
              <div>
                <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.8rem' }}>Active Routes</div>
                <h3 className="fw-bold mb-0">12</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card border-0 shadow-sm h-100 rounded-4">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-danger bg-opacity-10 text-danger rounded-3 p-3 fs-4">
                💵
              </div>
              <div>
                <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.8rem' }}>Today's Revenue</div>
                <h3 className="fw-bold mb-0">$4,320</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Live Vehicle Fleet GPS Tracking Map Widget */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ background: '#0f172a' }}>
            <Card.Header className="bg-transparent border-0 pt-3 px-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: 10, height: 10 }}></span>
                <h5 className="fw-bold text-white mb-0">Live Vehicle Fleet GPS Tracker</h5>
                <span className="badge bg-primary bg-opacity-25 text-info rounded-pill px-2 py-1 ms-2" style={{ fontSize: '0.75rem' }}>Real-time</span>
              </div>
              <Link to="/tracking" className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-2 text-decoration-none">
                <span>📍 Fullscreen Tracking & Telemetry</span> &rarr;
              </Link>
            </Card.Header>
            <Card.Body className="p-3">
              <div style={{ height: '380px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                <LiveVehicleMap height="100%" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="border-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Upcoming Schedules</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light text-muted">
                    <tr>
                      <th>Route</th>
                      <th>Bus</th>
                      <th>Departure</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-medium">New York → Boston</td>
                      <td>BUS-101</td>
                      <td>10:00 AM</td>
                      <td><span className="badge bg-primary rounded-pill">Scheduled</span></td>
                    </tr>
                    <tr>
                      <td className="fw-medium">Chicago → Detroit</td>
                      <td>BUS-204</td>
                      <td>11:30 AM</td>
                      <td><span className="badge bg-success rounded-pill">Boarding</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="border-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Fleet Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Available</span>
                  <span className="fw-bold small">14 (58%)</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-success" style={{ width: '58%' }}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Assigned</span>
                  <span className="fw-bold small">8 (33%)</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-primary" style={{ width: '33%' }}></div>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Maintenance</span>
                  <span className="fw-bold small">2 (9%)</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-warning" style={{ width: '9%' }}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
