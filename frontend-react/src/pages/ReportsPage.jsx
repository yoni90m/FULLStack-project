import React from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';

const ReportsPage = () => {
  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col><h4 className="fw-bold">📈 Analytics & Reports</h4></Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center py-4">
            <Card.Body>
              <div className="fs-1 mb-2">🚍</div>
              <h3 className="fw-bold">7</h3>
              <p className="text-muted mb-0">Total Buses</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center py-4">
            <Card.Body>
              <div className="fs-1 mb-2">🗺️</div>
              <h3 className="fw-bold">6</h3>
              <p className="text-muted mb-0">Active Routes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center py-4">
            <Card.Body>
              <div className="fs-1 mb-2">🎫</div>
              <h3 className="fw-bold">6</h3>
              <p className="text-muted mb-0">Total Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center py-4">
            <Card.Body>
              <div className="fs-1 mb-2">💰</div>
              <h3 className="fw-bold text-success">$3,440</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="border-0 pt-4 pb-0"><h5 className="fw-bold">Fleet Status Distribution</h5></Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Available</span><span className="fw-bold small">3 buses (43%)</span></div>
                <ProgressBar variant="success" now={43} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Assigned</span><span className="fw-bold small">2 buses (29%)</span></div>
                <ProgressBar variant="primary" now={29} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Maintenance</span><span className="fw-bold small">1 bus (14%)</span></div>
                <ProgressBar variant="warning" now={14} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Inactive</span><span className="fw-bold small">1 bus (14%)</span></div>
                <ProgressBar variant="secondary" now={14} style={{ height: '10px' }} className="rounded-pill" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="border-0 pt-4 pb-0"><h5 className="fw-bold">Revenue by Route</h5></Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Addis Ababa → Bahir Dar</span><span className="fw-bold small text-success">$1,950</span></div>
                <ProgressBar variant="info" now={57} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Addis Ababa → Hawassa</span><span className="fw-bold small text-success">$640</span></div>
                <ProgressBar variant="info" now={19} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Addis Ababa → Mekelle</span><span className="fw-bold small text-success">$850</span></div>
                <ProgressBar variant="info" now={25} style={{ height: '10px' }} className="rounded-pill" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="border-0 pt-4 pb-0"><h5 className="fw-bold">Payment Methods Breakdown</h5></Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">🟢 Telebirr (Ethio Telecom)</span><span className="fw-bold small">3 payments (50%)</span></div>
                <ProgressBar variant="success" now={50} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">📱 Mobile Banking (CBE, Awash, BoA)</span><span className="fw-bold small">2 payments (33%)</span></div>
                <ProgressBar variant="info" now={33} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">💵 Cash (Terminal / On-Board)</span><span className="fw-bold small">1 payment (17%)</span></div>
                <ProgressBar variant="warning" now={17} style={{ height: '10px' }} className="rounded-pill" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="border-0 pt-4 pb-0"><h5 className="fw-bold">Driver Performance</h5></Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">John Doe</span><span className="fw-bold small">2 trips assigned</span></div>
                <ProgressBar variant="success" now={40} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Sarah Connor</span><span className="fw-bold small">1 trip assigned</span></div>
                <ProgressBar variant="success" now={20} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Michael Scott</span><span className="fw-bold small">1 trip assigned</span></div>
                <ProgressBar variant="success" now={20} style={{ height: '10px' }} className="rounded-pill" />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Emma Watson</span><span className="fw-bold small">1 trip assigned</span></div>
                <ProgressBar variant="success" now={20} style={{ height: '10px' }} className="rounded-pill" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportsPage;
