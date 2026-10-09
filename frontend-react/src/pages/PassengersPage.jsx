import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const initialBookedPassengers = [
  { passenger_id: 1, name: 'Alice Smith', phone: '+251 911 123 456', email: 'alice.smith@gmail.com', bus_id: 1, bus_number: 'BUS-101', plate_number: 'NY-TR-8801', route_name: 'Addis Ababa → Bahir Dar', seat_number: '1A', booking_reference: 'TRIP-88201', departure_time: '2026-10-08 08:00', booking_status: 'Confirmed' },
  { passenger_id: 2, name: 'Bob Jones', phone: '+251 911 987 654', email: 'bob.jones@yahoo.com', bus_id: 1, bus_number: 'BUS-101', plate_number: 'NY-TR-8801', route_name: 'Addis Ababa → Bahir Dar', seat_number: '1B', booking_reference: 'TRIP-88202', departure_time: '2026-10-08 08:00', booking_status: 'Confirmed' },
  { passenger_id: 3, name: 'Clara Oswald', phone: '+251 911 654 321', email: 'clara.oswald@outlook.com', bus_id: 1, bus_number: 'BUS-101', plate_number: 'NY-TR-8801', route_name: 'Addis Ababa → Bahir Dar', seat_number: '2C', booking_reference: 'TRIP-88203', departure_time: '2026-10-08 08:00', booking_status: 'Confirmed' },
  { passenger_id: 1, name: 'Alice Smith', phone: '+251 911 123 456', email: 'alice.smith@gmail.com', bus_id: 3, bus_number: 'BUS-103', plate_number: 'CA-TR-1290', route_name: 'Addis Ababa → Hawassa', seat_number: '4A', booking_reference: 'TRIP-88204', departure_time: '2026-10-08 09:30', booking_status: 'Confirmed' },
  { passenger_id: 4, name: 'Daniel Craig', phone: '+251 911 789 012', email: 'daniel.craig@gmail.com', bus_id: 3, bus_number: 'BUS-103', plate_number: 'CA-TR-1290', route_name: 'Addis Ababa → Hawassa', seat_number: '4B', booking_reference: 'TRIP-88205', departure_time: '2026-10-08 09:30', booking_status: 'Confirmed' },
  { passenger_id: 2, name: 'Bob Jones', phone: '+251 911 987 654', email: 'bob.jones@yahoo.com', bus_id: 6, bus_number: 'BUS-106', plate_number: 'TX-TR-5519', route_name: 'Addis Ababa → Mekelle', seat_number: '3A', booking_reference: 'TRIP-88206', departure_time: '2026-10-10 07:30', booking_status: 'Confirmed' },
];

const PassengersPage = () => {
  const { authFetch } = useAuth() || {};
  const [passengers, setPassengers] = useState(initialBookedPassengers);
  const [search, setSearch] = useState('');
  const [busFilter, setBusFilter] = useState('all');

  useEffect(() => {
    if (authFetch) {
      authFetch('/passengers')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setPassengers(data.data);
          }
        })
        .catch(() => {});
    }
  }, [authFetch]);

  // Extract unique buses for filter dropdown
  const uniqueBuses = Array.from(
    new Map(passengers.filter(p => p.bus_number).map(p => [p.bus_number, p])).values()
  );

  const filtered = passengers.filter(p => {
    const s = search.toLowerCase();
    const matchesSearch =
      (p.name || '').toLowerCase().includes(s) ||
      (p.email || '').toLowerCase().includes(s) ||
      (p.phone || '').toLowerCase().includes(s) ||
      (p.bus_number || '').toLowerCase().includes(s) ||
      (p.booking_reference || '').toLowerCase().includes(s) ||
      (p.route_name || '').toLowerCase().includes(s);

    const matchesBus = busFilter === 'all' || (p.bus_number === busFilter || String(p.bus_id) === busFilter);
    return matchesSearch && matchesBus;
  });

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="fw-bold mb-1">👥 Booked Passenger Manifest</h4>
          <p className="text-muted small mb-0">Passengers arranged by assigned bus and booked travel itineraries</p>
        </Col>
        <Col xs="auto">
          <Badge bg="primary" className="px-3 py-2 rounded-pill fs-6">
            {filtered.length} Booked Passengers
          </Badge>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Search by passenger name, bus, ticket reference, or route..."
                className="rounded-3"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Select
                className="rounded-3"
                value={busFilter}
                onChange={e => setBusFilter(e.target.value)}
              >
                <option value="all">🚍 Filter by Bus (All Buses)</option>
                {uniqueBuses.map(b => (
                  <option key={b.bus_number} value={b.bus_number}>
                    🚍 {b.bus_number} ({b.plate_number || b.bus_model || ''})
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Passenger</th>
                  <th>Assigned Bus</th>
                  <th>Route & Departure</th>
                  <th>Seat</th>
                  <th>Ticket Ref</th>
                  <th className="d-none d-md-table-cell">Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No booked passengers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, idx) => (
                    <tr key={p.booking_id || `${p.passenger_id}-${idx}`}>
                      <td className="fw-medium">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: 34, height: 34 }}
                          >
                            {(p.name || 'P').charAt(0)}
                          </div>
                          <div>
                            <div>{p.name}</div>
                            <small className="text-muted">PID #{p.passenger_id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info" className="rounded-pill px-3 py-1 fw-bold">
                          🚍 {p.bus_number || 'BUS-101'}
                        </Badge>
                        {p.plate_number && (
                          <div className="small text-muted">{p.plate_number}</div>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{p.route_name || 'Addis Ababa → Bahir Dar'}</div>
                        <small className="text-muted">🕒 {p.departure_time || 'Scheduled'}</small>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border px-2 py-1 font-monospace">
                          💺 {p.seat_number || '1A'}
                        </Badge>
                      </td>
                      <td>
                        <code className="text-primary fw-bold small">
                          {p.booking_reference || 'TRIP-88201'}
                        </code>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <div className="small">✉️ {p.email}</div>
                        <small className="text-muted">📞 {p.phone}</small>
                      </td>
                      <td>
                        <Badge
                          bg={(p.booking_status || 'Confirmed') === 'Confirmed' ? 'success' : 'secondary'}
                          className="rounded-pill px-3 py-2"
                        >
                          {p.booking_status || 'Confirmed'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PassengersPage;
