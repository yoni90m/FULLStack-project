import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';

const initialRoutes = [
  { route_id: 1, origin: 'Addis Ababa', destination: 'Bahir Dar', distance: 565.0, estimated_duration: '9h 30m', fare: 650.00, status: 'Active' },
  { route_id: 2, origin: 'Addis Ababa', destination: 'Hawassa', distance: 275.0, estimated_duration: '4h 30m', fare: 320.00, status: 'Active' },
  { route_id: 3, origin: 'Addis Ababa', destination: 'Dire Dawa', distance: 445.0, estimated_duration: '7h 45m', fare: 550.00, status: 'Active' },
  { route_id: 4, origin: 'Addis Ababa', destination: 'Mekelle', distance: 780.0, estimated_duration: '12h 00m', fare: 850.00, status: 'Active' },
  { route_id: 5, origin: 'Addis Ababa', destination: 'Jimma', distance: 350.0, estimated_duration: '6h 00m', fare: 420.00, status: 'Active' },
  { route_id: 6, origin: 'Addis Ababa', destination: "Debre Mark'os", distance: 300.0, estimated_duration: '5h 30m', fare: 380.00, status: 'Active' },
];

const RoutesPage = () => {
  const [routes, setRoutes] = useState(initialRoutes);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editRoute, setEditRoute] = useState(null);
  const [form, setForm] = useState({ origin: '', destination: '', distance: '', estimated_duration: '', fare: '', status: 'Active' });

  const openAdd = () => { setEditRoute(null); setForm({ origin: '', destination: '', distance: '', estimated_duration: '', fare: '', status: 'Active' }); setShowModal(true); };
  const openEdit = (r) => { setEditRoute(r); setForm({ ...r }); setShowModal(true); };

  const handleSave = () => {
    if (editRoute) {
      setRoutes(routes.map(r => r.route_id === editRoute.route_id ? { ...r, ...form, distance: Number(form.distance), fare: Number(form.fare) } : r));
    } else {
      setRoutes([...routes, { ...form, route_id: Date.now(), distance: Number(form.distance), fare: Number(form.fare) }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => setRoutes(routes.filter(r => r.route_id !== id));

  const filtered = routes.filter(r =>
    r.origin.toLowerCase().includes(search.toLowerCase()) ||
    r.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col><h4 className="fw-bold">🗺️ Route Management</h4></Col>
        <Col xs="auto"><Button variant="primary" className="rounded-pill px-4" onClick={openAdd}>+ Add Route</Button></Col>
      </Row>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Form.Control type="text" placeholder="Search routes..." className="mb-3 rounded-3" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th className="d-none d-md-table-cell">Distance (km)</th>
                  <th className="d-none d-md-table-cell">Duration</th>
                  <th>Fare (ETB)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.route_id}>
                    <td className="fw-medium">{r.origin}</td>
                    <td>{r.destination}</td>
                    <td className="d-none d-md-table-cell">{r.distance}</td>
                    <td className="d-none d-md-table-cell">{r.estimated_duration}</td>
                    <td className="fw-bold">${r.fare.toFixed(2)}</td>
                    <td><Badge bg="success" className="rounded-pill px-3 py-2">{r.status}</Badge></td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-2 rounded-pill" onClick={() => openEdit(r)}>✏️</Button>
                      <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleDelete(r.route_id)}>🗑️</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editRoute ? 'Edit Route' : 'Add New Route'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3"><Form.Label>Origin</Form.Label><Form.Control value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Destination</Form.Label><Form.Control value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Distance (km)</Form.Label><Form.Control type="number" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Duration</Form.Label><Form.Control value={form.estimated_duration} onChange={e => setForm({ ...form, estimated_duration: e.target.value })} placeholder="e.g. 5h 30m" /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Fare (ETB)</Form.Label><Form.Control type="number" value={form.fare} onChange={e => setForm({ ...form, fare: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Status</Form.Label>
            <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>Active</option><option>Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Route</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoutesPage;
