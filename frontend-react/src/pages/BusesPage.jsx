import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const initialBuses = [
  { bus_id: 1, bus_number: 'BUS-101', plate_number: 'NY-TR-8801', model: 'Volvo 9700 Luxury Cruiser', capacity: 40, status: 'Assigned' },
  { bus_id: 2, bus_number: 'BUS-102', plate_number: 'MA-TR-4422', model: 'Mercedes-Benz Tourismo', capacity: 36, status: 'Available' },
  { bus_id: 3, bus_number: 'BUS-103', plate_number: 'CA-TR-1290', model: 'Scania Touring HD', capacity: 44, status: 'Assigned' },
  { bus_id: 4, bus_number: 'BUS-104', plate_number: 'IL-TR-9031', model: 'MCI J4500 Coach', capacity: 40, status: 'Available' },
  { bus_id: 5, bus_number: 'BUS-105', plate_number: 'WA-TR-3384', model: 'Prevost H3-45 Executive', capacity: 32, status: 'Maintenance' },
  { bus_id: 6, bus_number: 'BUS-106', plate_number: 'TX-TR-5519', model: 'Setra ComfortClass S 515', capacity: 40, status: 'Available' },
  { bus_id: 7, bus_number: 'BUS-107', plate_number: 'FL-TR-7720', model: 'Volvo 9900 VIP Sleeper', capacity: 28, status: 'Inactive' },
];

const statusVariant = {
  Available: 'success',
  Assigned: 'primary',
  Maintenance: 'warning',
  Inactive: 'secondary',
};

const BusesPage = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState(initialBuses);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editBus, setEditBus] = useState(null);
  const [form, setForm] = useState({ bus_number: '', plate_number: '', model: '', capacity: '', status: 'Available' });

  const openAdd = () => { setEditBus(null); setForm({ bus_number: '', plate_number: '', model: '', capacity: '', status: 'Available' }); setShowModal(true); };
  const openEdit = (bus) => { setEditBus(bus); setForm({ ...bus }); setShowModal(true); };

  const handleSave = () => {
    if (editBus) {
      setBuses(buses.map(b => b.bus_id === editBus.bus_id ? { ...b, ...form } : b));
    } else {
      setBuses([...buses, { ...form, bus_id: Date.now(), capacity: Number(form.capacity) }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => { setBuses(buses.filter(b => b.bus_id !== id)); };

  const filtered = buses.filter(b =>
    b.bus_number.toLowerCase().includes(search.toLowerCase()) ||
    b.model.toLowerCase().includes(search.toLowerCase()) ||
    b.plate_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col><h4 className="fw-bold">🚍 Bus Fleet Management</h4></Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="outline-info" className="rounded-pill px-3" onClick={() => navigate('/tracking')}>
            📍 Live Map Tracker
          </Button>
          <Button variant="primary" className="rounded-pill px-4" onClick={openAdd}>+ Add New Bus</Button>
        </Col>
      </Row>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Form.Control type="text" placeholder="Search buses..." className="mb-3 rounded-3" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Bus Number</th>
                  <th className="d-none d-md-table-cell">Plate</th>
                  <th className="d-none d-lg-table-cell">Model</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(bus => (
                  <tr key={bus.bus_id}>
                    <td className="fw-medium">{bus.bus_number}</td>
                    <td className="d-none d-md-table-cell">{bus.plate_number}</td>
                    <td className="d-none d-lg-table-cell">{bus.model}</td>
                    <td>{bus.capacity}</td>
                    <td><Badge bg={statusVariant[bus.status]} className="rounded-pill px-3 py-2">{bus.status}</Badge></td>
                    <td>
                      <Button size="sm" variant="outline-info" className="me-2 rounded-pill" onClick={() => navigate('/tracking')}>
                        📍 Track
                      </Button>
                      <Button size="sm" variant="outline-primary" className="me-2 rounded-pill" onClick={() => openEdit(bus)}>✏️ Edit</Button>
                      <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleDelete(bus.bus_id)}>🗑️</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editBus ? 'Edit Bus' : 'Add New Bus'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3"><Form.Label>Bus Number</Form.Label><Form.Control value={form.bus_number} onChange={e => setForm({ ...form, bus_number: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Plate Number</Form.Label><Form.Control value={form.plate_number} onChange={e => setForm({ ...form, plate_number: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Model</Form.Label><Form.Control value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Capacity</Form.Label><Form.Control type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Status</Form.Label>
            <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>Available</option><option>Assigned</option><option>Maintenance</option><option>Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Bus</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BusesPage;
