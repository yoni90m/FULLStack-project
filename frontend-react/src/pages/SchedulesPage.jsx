import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';

const initialSchedules = [
  { schedule_id: 1, bus_number: 'BUS-101', route: 'Addis Ababa → Bahir Dar', driver: 'John Doe', departure_time: '2026-10-06 08:00', arrival_time: '2026-10-06 17:30', available_seats: 37, fare: 650.00, status: 'Scheduled' },
  { schedule_id: 2, bus_number: 'BUS-102', route: 'Addis Ababa → Bahir Dar', driver: 'Sarah Connor', departure_time: '2026-10-07 14:00', arrival_time: '2026-10-07 23:30', available_seats: 36, fare: 650.00, status: 'Scheduled' },
  { schedule_id: 3, bus_number: 'BUS-103', route: 'Addis Ababa → Hawassa', driver: 'Michael Scott', departure_time: '2026-10-06 09:30', arrival_time: '2026-10-06 14:00', available_seats: 42, fare: 320.00, status: 'Scheduled' },
  { schedule_id: 4, bus_number: 'BUS-104', route: 'Addis Ababa → Dire Dawa', driver: 'Emma Watson', departure_time: '2026-10-08 10:00', arrival_time: '2026-10-08 17:45', available_seats: 40, fare: 550.00, status: 'Scheduled' },
  { schedule_id: 5, bus_number: 'BUS-106', route: 'Addis Ababa → Mekelle', driver: 'John Doe', departure_time: '2026-10-09 07:30', arrival_time: '2026-10-09 19:30', available_seats: 39, fare: 850.00, status: 'Scheduled' },
];

const statusVariant = { Scheduled: 'primary', 'In Transit': 'info', Completed: 'success', Cancelled: 'danger' };

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [search, setSearch] = useState('');

  const filtered = schedules.filter(s =>
    s.route.toLowerCase().includes(search.toLowerCase()) ||
    s.bus_number.toLowerCase().includes(search.toLowerCase()) ||
    s.driver.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col><h4 className="fw-bold">🕒 Schedule Management</h4></Col>
        <Col xs="auto"><Button variant="primary" className="rounded-pill px-4">+ Add Schedule</Button></Col>
      </Row>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Form.Control type="text" placeholder="Search schedules..." className="mb-3 rounded-3" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Route</th>
                  <th className="d-none d-sm-table-cell">Bus</th>
                  <th className="d-none d-md-table-cell">Driver</th>
                  <th>Departure</th>
                  <th className="d-none d-lg-table-cell">Arrival</th>
                  <th>Seats</th>
                  <th className="d-none d-md-table-cell">Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.schedule_id}>
                    <td className="fw-medium">{s.route}</td>
                    <td className="d-none d-sm-table-cell">{s.bus_number}</td>
                    <td className="d-none d-md-table-cell">{s.driver}</td>
                    <td>{s.departure_time}</td>
                    <td className="d-none d-lg-table-cell">{s.arrival_time}</td>
                    <td><Badge bg="info" className="rounded-pill">{s.available_seats}</Badge></td>
                    <td className="d-none d-md-table-cell fw-bold">${s.fare.toFixed(2)}</td>
                    <td><Badge bg={statusVariant[s.status] || 'secondary'} className="rounded-pill px-3 py-2">{s.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SchedulesPage;
