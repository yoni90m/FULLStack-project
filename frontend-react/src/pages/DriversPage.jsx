import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';

const initialDrivers = [
  { driver_id: 1, name: 'John Doe', phone: '+251 911 234 567', license_number: 'DL-AA-9023812', status: 'Active' },
  { driver_id: 2, name: 'Sarah Connor', phone: '+251 911 876 543', license_number: 'DL-AA-4491028', status: 'Active' },
  { driver_id: 3, name: 'Michael Scott', phone: '+251 911 345 678', license_number: 'DL-AA-1102934', status: 'Active' },
  { driver_id: 4, name: 'David Miller', phone: '+251 911 456 789', license_number: 'DL-AA-5591023', status: 'On Leave' },
  { driver_id: 5, name: 'Emma Watson', phone: '+251 911 678 901', license_number: 'DL-AA-8837192', status: 'Active' },
];

const statusVariant = { Active: 'success', 'On Leave': 'warning', Inactive: 'secondary' };

const DriversPage = () => {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editDriver, setEditDriver] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', license_number: '', status: 'Active' });

  const openAdd = () => { setEditDriver(null); setForm({ name: '', phone: '', license_number: '', status: 'Active' }); setShowModal(true); };
  const openEdit = (d) => { setEditDriver(d); setForm({ ...d }); setShowModal(true); };

  const handleSave = () => {
    if (editDriver) {
      setDrivers(drivers.map(d => d.driver_id === editDriver.driver_id ? { ...d, ...form } : d));
    } else {
      setDrivers([...drivers, { ...form, driver_id: Date.now() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => setDrivers(drivers.filter(d => d.driver_id !== id));

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.license_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col><h4 className="fw-bold">👨‍✈️ Driver Management</h4></Col>
        <Col xs="auto"><Button variant="primary" className="rounded-pill px-4" onClick={openAdd}>+ Add Driver</Button></Col>
      </Row>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Form.Control type="text" placeholder="Search drivers..." className="mb-3 rounded-3" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th className="d-none d-md-table-cell">Phone</th>
                  <th className="d-none d-sm-table-cell">License Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.driver_id}>
                    <td className="fw-medium">{d.name}</td>
                    <td className="d-none d-md-table-cell">{d.phone}</td>
                    <td className="d-none d-sm-table-cell"><code>{d.license_number}</code></td>
                    <td><Badge bg={statusVariant[d.status]} className="rounded-pill px-3 py-2">{d.status}</Badge></td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-2 rounded-pill" onClick={() => openEdit(d)}>✏️</Button>
                      <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleDelete(d.driver_id)}>🗑️</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editDriver ? 'Edit Driver' : 'Add New Driver'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3"><Form.Label>Full Name</Form.Label><Form.Control value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Phone</Form.Label><Form.Control value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>License Number</Form.Label><Form.Control value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Status</Form.Label>
            <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>Active</option><option>On Leave</option><option>Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Driver</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DriversPage;
