import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';

const initialBookings = [
  { booking_id: 1, booking_reference: 'TRIP-88201', passenger: 'Alice Smith', route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', seat_number: '1A', booking_date: '2026-10-03', booking_status: 'Confirmed' },
  { booking_id: 2, booking_reference: 'TRIP-88202', passenger: 'Bob Jones', route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', seat_number: '1B', booking_date: '2026-10-04', booking_status: 'Confirmed' },
  { booking_id: 3, booking_reference: 'TRIP-88203', passenger: 'Clara Oswald', route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', seat_number: '2C', booking_date: '2026-10-04', booking_status: 'Confirmed' },
  { booking_id: 4, booking_reference: 'TRIP-88204', passenger: 'Alice Smith', route: 'Addis Ababa → Hawassa', bus: 'BUS-103', seat_number: '4A', booking_date: '2026-10-04', booking_status: 'Confirmed' },
  { booking_id: 5, booking_reference: 'TRIP-88205', passenger: 'Daniel Craig', route: 'Addis Ababa → Hawassa', bus: 'BUS-103', seat_number: '4B', booking_date: '2026-10-04', booking_status: 'Confirmed' },
  { booking_id: 6, booking_reference: 'TRIP-88206', passenger: 'Bob Jones', route: 'Addis Ababa → Mekelle', bus: 'BUS-106', seat_number: '3A', booking_date: '2026-10-04', booking_status: 'Confirmed' },
];

const statusVariant = { Confirmed: 'success', Pending: 'warning', Cancelled: 'danger' };

const BookingsPage = () => {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = bookings.filter(b => {
    const matchSearch = b.booking_reference.toLowerCase().includes(search.toLowerCase()) ||
      b.passenger.toLowerCase().includes(search.toLowerCase()) ||
      b.route.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || b.booking_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCancel = (id) => {
    setBookings(bookings.map(b => b.booking_id === id ? { ...b, booking_status: 'Cancelled' } : b));
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col><h4 className="fw-bold">🎫 Bookings & Seats</h4></Col>
        <Col xs="auto"><Button variant="primary" className="rounded-pill px-4">+ New Booking</Button></Col>
      </Row>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={8}>
              <Form.Control type="text" placeholder="Search by reference, passenger, or route..." className="rounded-3" value={search} onChange={e => setSearch(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Select className="rounded-3" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Col>
          </Row>
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Reference</th>
                  <th>Passenger</th>
                  <th className="d-none d-md-table-cell">Route</th>
                  <th className="d-none d-lg-table-cell">Bus</th>
                  <th>Seat</th>
                  <th className="d-none d-sm-table-cell">Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.booking_id}>
                    <td className="fw-bold text-primary">{b.booking_reference}</td>
                    <td>{b.passenger}</td>
                    <td className="d-none d-md-table-cell">{b.route}</td>
                    <td className="d-none d-lg-table-cell">{b.bus}</td>
                    <td><Badge bg="dark" className="rounded-pill">{b.seat_number}</Badge></td>
                    <td className="d-none d-sm-table-cell">{b.booking_date}</td>
                    <td><Badge bg={statusVariant[b.booking_status]} className="rounded-pill px-3 py-2">{b.booking_status}</Badge></td>
                    <td>
                      {b.booking_status !== 'Cancelled' && (
                        <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleCancel(b.booking_id)}>Cancel</Button>
                      )}
                    </td>
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

export default BookingsPage;
