import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Image, Button, Badge, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LiveVehicleMap from './LiveVehicleMap';
import heroBus from '../assets/hero_bus.jpg';

const AdminDashboard = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_buses: 7,
    total_drivers: 5,
    total_routes: 6,
    total_passengers: 8,
    total_bookings: 6,
    total_revenue: '3440.00',
    active_buses: 5
  });

  const [incidents, setIncidents] = useState([
    { id: 1, driver: 'John Doe', bus: 'BUS-101', issue: 'Delay', desc: 'Heavy rain near Sululta mountain pass caused 25m delay', time: '1h ago', status: 'Under Review' },
    { id: 2, driver: 'Sarah Connor', bus: 'BUS-102', issue: 'Maintenance', desc: 'Front tire pressure low sensor alert at Mojo station', time: '3h ago', status: 'Resolved' }
  ]);

  useEffect(() => {
    if (authFetch) {
      authFetch('/reports/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setStats(data.data);
          }
        })
        .catch(() => {});

      authFetch('/reports/incidents')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setIncidents(data.data);
          }
        })
        .catch(() => {});
    }
  }, [authFetch]);

  return (
    <Container fluid className="p-4">
      {/* Welcome Banner */}
      <Row className="mb-4">
        <Col>
          <div className="welcome-banner p-4 rounded-4 text-white shadow-lg d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-danger rounded-pill px-3 py-1 fw-bold mb-2">
                👑 System Administrator Console
              </span>
              <h2 className="fw-bold mb-1">Welcome back, {user?.username || 'Admin'}! 👋</h2>
              <p className="mb-0 text-white-50">
                Full operational command over intercity bus fleets, driver dispatches, financial ledgers, and passenger safety.
              </p>
              <div className="mt-3 d-flex gap-2 flex-wrap">
                <Button variant="info" className="rounded-pill px-3 fw-semibold text-dark" onClick={() => navigate('/buses')}>
                  🚍 Manage Bus Fleet
                </Button>
                <Button variant="outline-light" className="rounded-pill px-3" onClick={() => navigate('/drivers')}>
                  👨‍✈️ Driver Roster
                </Button>
                <Button variant="outline-light" className="rounded-pill px-3" onClick={() => navigate('/passengers')}>
                  👥 Passenger Manifests
                </Button>
                <Button variant="outline-light" className="rounded-pill px-3" onClick={() => navigate('/reports')}>
                  📈 Financial Analytics
                </Button>
              </div>
            </div>
            <div className="d-none d-sm-block text-center z-1">
              <Image
                src={heroBus}
                alt="Bus Administrator"
                roundedCircle
                className="shadow-sm"
                style={{ width: '130px', height: '130px', objectFit: 'cover', border: '4px solid rgba(255, 255, 255, 0.3)' }}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* KPI Stats Grid */}
      <Row className="g-4 mb-4">
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3 text-center">
            <div className="fs-2 mb-1">🚍</div>
            <div className="text-muted small fw-semibold text-uppercase">Buses</div>
            <h4 className="fw-bold mb-0 text-info">{stats.total_buses} Fleet</h4>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3 text-center">
            <div className="fs-2 mb-1">👨‍✈️</div>
            <div className="text-muted small fw-semibold text-uppercase">Drivers</div>
            <h4 className="fw-bold mb-0 text-primary">{stats.total_drivers} Active</h4>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3 text-center">
            <div className="fs-2 mb-1">👥</div>
            <div className="text-muted small fw-semibold text-uppercase">Passengers</div>
            <h4 className="fw-bold mb-0 text-warning">{stats.total_passengers} Reg</h4>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3 text-center">
            <div className="fs-2 mb-1">🗺️</div>
            <div className="text-muted small fw-semibold text-uppercase">Routes</div>
            <h4 className="fw-bold mb-0 text-info">{stats.total_routes} Lines</h4>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3 text-center">
            <div className="fs-2 mb-1">🎫</div>
            <div className="text-muted small fw-semibold text-uppercase">Bookings</div>
            <h4 className="fw-bold mb-0 text-success">{stats.total_bookings} Trips</h4>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3 text-center">
            <div className="fs-2 mb-1">💰</div>
            <div className="text-muted small fw-semibold text-uppercase">Revenue</div>
            <h4 className="fw-bold mb-0 text-success">${stats.total_revenue}</h4>
          </Card>
        </Col>
      </Row>

      {/* Real-time Fleet GPS Live Map Widget */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ background: '#0f172a' }}>
            <Card.Header className="bg-transparent border-0 pt-3 px-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: 10, height: 10 }}></span>
                <h5 className="fw-bold text-white mb-0">Live Intercity Fleet GPS Tracker</h5>
                <span className="badge bg-primary bg-opacity-25 text-info rounded-pill px-2 py-1 ms-2" style={{ fontSize: '0.75rem' }}>Active Telemetry</span>
              </div>
              <Link to="/tracking" className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-2 text-decoration-none">
                <span>📍 Fullscreen Tracking & Telemetry</span> &rarr;
              </Link>
            </Card.Header>
            <Card.Body className="p-3">
              <div style={{ height: '360px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                <LiveVehicleMap height="100%" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Operational Alerts & Recent Incidents */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white h-100">
            <Card.Header className="bg-transparent border-secondary border-opacity-25 pt-3 pb-2 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-white mb-0">⚠️ Driver Reported Problems & Delays</h5>
              <Badge bg="warning" text="dark" className="rounded-pill px-3">{incidents.length} Reported</Badge>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-3">
                {incidents.map((inc, i) => (
                  <div key={i} className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div>
                        <span className="fw-bold text-warning">{inc.issue_type || inc.issue}</span>
                        <span className="text-white-50 small ms-2">({inc.bus_number || inc.bus} - {inc.driver_name || inc.driver})</span>
                      </div>
                      <Badge bg={inc.status === 'Resolved' ? 'success' : 'warning'} className="rounded-pill">
                        {inc.status}
                      </Badge>
                    </div>
                    <p className="small text-white-50 mb-0">{inc.description || inc.desc}</p>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white h-100">
            <Card.Header className="bg-transparent border-secondary border-opacity-25 pt-3 pb-2 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-white mb-0">⚡ Quick Management Shortcuts</h5>
              <Badge bg="info" className="rounded-pill">Administrative</Badge>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" className="text-start rounded-3 py-2 px-3 d-flex justify-content-between align-items-center" onClick={() => navigate('/schedules')}>
                  <span>🕒 <strong>Create Trip Schedule</strong> — Assign bus and driver</span>
                  <span>&rarr;</span>
                </Button>
                <Button variant="outline-info" className="text-start rounded-3 py-2 px-3 d-flex justify-content-between align-items-center" onClick={() => navigate('/buses')}>
                  <span>🚍 <strong>Commission Fleet Bus</strong> — Add plate number and capacity</span>
                  <span>&rarr;</span>
                </Button>
                <Button variant="outline-warning" className="text-start rounded-3 py-2 px-3 d-flex justify-content-between align-items-center" onClick={() => navigate('/drivers')}>
                  <span>👨‍✈️ <strong>Driver Onboarding</strong> — Verify licenses and phone</span>
                  <span>&rarr;</span>
                </Button>
                <Button variant="outline-success" className="text-start rounded-3 py-2 px-3 d-flex justify-content-between align-items-center" onClick={() => navigate('/payments')}>
                  <span>💳 <strong>Audit Payments & Ledgers</strong> — View transactions</span>
                  <span>&rarr;</span>
                </Button>
                <Button variant="outline-light" className="text-start rounded-3 py-2 px-3 d-flex justify-content-between align-items-center" onClick={() => navigate('/settings')}>
                  <span>⚙️ <strong>System Policies & Audit Logs</strong> — Configure rules</span>
                  <span>&rarr;</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
