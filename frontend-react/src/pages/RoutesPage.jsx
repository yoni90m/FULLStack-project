import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RouteMap, { CITY_COORDINATES } from '../components/RouteMap';

const initialRoutes = [
  { route_id: 1, origin: 'Addis Ababa', destination: 'Bahir Dar', distance: 565.0, estimated_duration: '9h 30m', fare: 650.00, status: 'Active' },
  { route_id: 2, origin: 'Addis Ababa', destination: 'Hawassa', distance: 275.0, estimated_duration: '4h 30m', fare: 320.00, status: 'Active' },
  { route_id: 3, origin: 'Addis Ababa', destination: 'Dire Dawa', distance: 445.0, estimated_duration: '7h 45m', fare: 550.00, status: 'Active' },
  { route_id: 4, origin: 'Addis Ababa', destination: 'Mekelle', distance: 780.0, estimated_duration: '12h 00m', fare: 850.00, status: 'Active' },
  { route_id: 5, origin: 'Addis Ababa', destination: 'Jimma', distance: 350.0, estimated_duration: '6h 00m', fare: 420.00, status: 'Active' },
  { route_id: 6, origin: 'Addis Ababa', destination: "Debre Mark'os", distance: 300.0, estimated_duration: '5h 30m', fare: 380.00, status: 'Active' },
];

const RoutesPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState(initialRoutes);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'map', 'table'
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editRoute, setEditRoute] = useState(null);
  const [form, setForm] = useState({ origin: '', destination: '', distance: '', estimated_duration: '', fare: '', status: 'Active' });

  const openAdd = () => {
    setEditRoute(null);
    setForm({ origin: 'Addis Ababa', destination: '', distance: '', estimated_duration: '', fare: '', status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (r, e) => {
    if (e) e.stopPropagation();
    setEditRoute(r);
    setForm({ ...r });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editRoute) {
      const updated = routes.map(r => r.route_id === editRoute.route_id ? { ...r, ...form, distance: Number(form.distance), fare: Number(form.fare) } : r);
      setRoutes(updated);
      if (selectedRoute?.route_id === editRoute.route_id) {
        setSelectedRoute({ ...selectedRoute, ...form, distance: Number(form.distance), fare: Number(form.fare) });
      }
    } else {
      const newRoute = { ...form, route_id: Date.now(), distance: Number(form.distance), fare: Number(form.fare) };
      setRoutes([...routes, newRoute]);
      setSelectedRoute(newRoute);
    }
    setShowModal(false);
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    setRoutes(routes.filter(r => r.route_id !== id));
    if (selectedRoute?.route_id === id) {
      setSelectedRoute(null);
    }
  };

  const filtered = routes.filter(r =>
    r.origin.toLowerCase().includes(search.toLowerCase()) ||
    r.destination.toLowerCase().includes(search.toLowerCase())
  );

  // Quick stats
  const totalKm = routes.reduce((sum, r) => sum + (Number(r.distance) || 0), 0);
  const avgFare = routes.length ? (routes.reduce((sum, r) => sum + (Number(r.fare) || 0), 0) / routes.length).toFixed(0) : 0;

  return (
    <Container fluid className="p-4">
      {/* Top Header & Quick Actions */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold mb-0">🗺️ Route Network Management</h4>
            <Badge bg="primary" className="rounded-pill px-3 py-2 ms-2">
              {routes.length} Active Corridors
            </Badge>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Manage intercity transit routes, distance metrics, and live visual map corridors across Ethiopia.
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          {/* View Mode Toggle */}
          <ButtonGroup className="shadow-sm">
            <Button
              variant={viewMode === 'split' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setViewMode('split')}
              title="Split View (Map + Table)"
            >
              ◫ Split View
            </Button>
            <Button
              variant={viewMode === 'map' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setViewMode('map')}
              title="Map Only"
            >
              🗺️ Map Only
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setViewMode('table')}
              title="Table Only"
            >
              📋 Table Only
            </Button>
          </ButtonGroup>

          {isAdmin ? (
            <Button variant="success" className="rounded-pill px-3 shadow-sm" onClick={openAdd}>
              + Add Route
            </Button>
          ) : (
            <Button variant="info" className="rounded-pill px-3 shadow-sm text-dark fw-semibold" onClick={() => navigate('/bookings')}>
              💺 Book Empty Chair
            </Button>
          )}
        </Col>
      </Row>

      {/* Metrics Row */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-primary bg-opacity-10">
            <Card.Body className="p-3">
              <div className="text-muted small fw-semibold">TOTAL NETWORK COVERAGE</div>
              <div className="fs-4 fw-bold text-primary mt-1">{totalKm.toLocaleString()} km</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-success bg-opacity-10">
            <Card.Body className="p-3">
              <div className="text-muted small fw-semibold">ACTIVE CORRIDORS</div>
              <div className="fs-4 fw-bold text-success mt-1">{routes.filter(r => r.status === 'Active').length} Routes</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-warning bg-opacity-10">
            <Card.Body className="p-3">
              <div className="text-muted small fw-semibold">AVERAGE FARE</div>
              <div className="fs-4 fw-bold text-warning-emphasis mt-1">ETB {avgFare}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-info bg-opacity-10">
            <Card.Body className="p-3">
              <div className="text-muted small fw-semibold">SELECTED ROUTE</div>
              <div className="fs-6 fw-bold text-info-emphasis mt-2 text-truncate">
                {selectedRoute ? `${selectedRoute.origin} ➔ ${selectedRoute.destination}` : 'Click route to inspect'}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content: Map & Table Views */}
      <Row className="g-4">
        {/* Route Map Column */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <Col lg={viewMode === 'split' ? 6 : 12}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
              <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-0">🌐 Interactive Route Corridor Visualizer</h6>
                  <small className="text-muted">Click any route polyline or marker pin to isolate corridor</small>
                </div>
                {selectedRoute && (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    className="rounded-pill px-3 py-1"
                    onClick={() => setSelectedRoute(null)}
                  >
                    Clear Focus
                  </Button>
                )}
              </Card.Header>
              <Card.Body className="p-2">
                <RouteMap
                  routes={filtered}
                  selectedRoute={selectedRoute}
                  onSelectRoute={(r) => setSelectedRoute(r)}
                  height={viewMode === 'split' ? '540px' : '620px'}
                  theme="light"
                />
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Routes Table Column */}
        {(viewMode === 'split' || viewMode === 'table') && (
          <Col lg={viewMode === 'split' ? 6 : 12}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Header className="bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0">📋 Route Directory</h6>
                  <span className="badge bg-light text-dark border">
                    {filtered.length} found
                  </span>
                </div>
              </Card.Header>
              <Card.Body className="p-3">
                <Form.Control
                  type="text"
                  placeholder="🔍 Search origin or destination (e.g. Addis, Bahir Dar)..."
                  className="mb-3 rounded-3"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Route Corridor</th>
                        <th className="d-none d-md-table-cell">Distance</th>
                        <th className="d-none d-md-table-cell">Duration</th>
                        <th>Fare</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(r => {
                        const isSelected = selectedRoute?.route_id === r.route_id;
                        return (
                          <tr
                            key={r.route_id}
                            onClick={() => setSelectedRoute(isSelected ? null : r)}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : undefined,
                              borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent'
                            }}
                          >
                            <td>
                              <div className="fw-bold text-dark">{r.origin} ➔ {r.destination}</div>
                              {isSelected && <span className="badge bg-primary rounded-pill px-2 py-0" style={{ fontSize: '0.65rem' }}>Focused on Map</span>}
                            </td>
                            <td className="d-none d-md-table-cell">{r.distance} km</td>
                            <td className="d-none d-md-table-cell">{r.estimated_duration}</td>
                            <td className="fw-bold text-primary">ETB {Number(r.fare).toFixed(2)}</td>
                            <td>
                              <Badge bg={r.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill px-2 py-1">
                                {r.status}
                              </Badge>
                            </td>
                            <td className="text-end" onClick={e => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant={isSelected ? 'primary' : 'outline-primary'}
                                className="me-2 rounded-circle p-1"
                                style={{ width: '30px', height: '30px' }}
                                onClick={() => setSelectedRoute(isSelected ? null : r)}
                                title="Focus on map"
                              >
                                🗺️
                              </Button>
                              {isAdmin ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    className="me-1 rounded-circle p-1"
                                    style={{ width: '30px', height: '30px' }}
                                    onClick={(e) => openEdit(r, e)}
                                    title="Edit route"
                                  >
                                    ✏️
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    className="rounded-circle p-1"
                                    style={{ width: '30px', height: '30px' }}
                                    onClick={(e) => handleDelete(r.route_id, e)}
                                    title="Delete route"
                                  >
                                    🗑️
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  className="rounded-pill px-2 py-0"
                                  style={{ fontSize: '0.75rem' }}
                                  onClick={() => navigate('/bookings')}
                                  title="Book seat on this corridor"
                                >
                                  💺 Book
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Add / Edit Route Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editRoute ? '✏️ Edit Transit Route' : '➕ Add New Route'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Origin City</Form.Label>
            <Form.Select
              value={form.origin}
              onChange={e => setForm({ ...form, origin: e.target.value })}
            >
              <option value="">Select origin...</option>
              {Object.keys(CITY_COORDINATES).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Destination City</Form.Label>
            <Form.Select
              value={form.destination}
              onChange={e => setForm({ ...form, destination: e.target.value })}
            >
              <option value="">Select destination...</option>
              {Object.keys(CITY_COORDINATES).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Row>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Distance (km)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.distance}
                  onChange={e => setForm({ ...form, distance: e.target.value })}
                  placeholder="e.g. 565"
                />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Duration</Form.Label>
                <Form.Control
                  value={form.estimated_duration}
                  onChange={e => setForm({ ...form, estimated_duration: e.target.value })}
                  placeholder="e.g. 9h 30m"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Fare (ETB)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.fare}
                  onChange={e => setForm({ ...form, fare: e.target.value })}
                  placeholder="e.g. 650"
                />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {editRoute ? 'Save Changes' : 'Create Route'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoutesPage;
