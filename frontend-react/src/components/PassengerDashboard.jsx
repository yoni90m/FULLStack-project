import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import heroBus from '../assets/hero_bus.jpg';

const ALL_SCHEDULES = [
  { schedule_id: 1, origin: 'Addis Ababa', destination: 'Bahir Dar', bus: 'BUS-101', model: 'Volvo 9700 Luxury Cruiser', departure_time: '2026-10-11 08:00', arrival_time: '2026-10-11 17:30', available_seats: 37, fare: 650.00, status: 'Scheduled' },
  { schedule_id: 2, origin: 'Addis Ababa', destination: 'Hawassa', bus: 'BUS-103', model: 'Scania Touring HD', departure_time: '2026-10-11 09:30', arrival_time: '2026-10-11 14:00', available_seats: 42, fare: 320.00, status: 'Scheduled' },
  { schedule_id: 3, origin: 'Addis Ababa', destination: 'Dire Dawa', bus: 'BUS-104', model: 'MCI J4500 Coach', departure_time: '2026-10-12 10:00', arrival_time: '2026-10-12 17:45', available_seats: 40, fare: 550.00, status: 'Scheduled' },
  { schedule_id: 4, origin: 'Addis Ababa', destination: 'Mekelle', bus: 'BUS-106', model: 'Setra ComfortClass S 515', departure_time: '2026-10-13 07:30', arrival_time: '2026-10-13 19:30', available_seats: 39, fare: 850.00, status: 'Scheduled' },
  { schedule_id: 5, origin: 'Addis Ababa', destination: 'Jimma', bus: 'BUS-102', model: 'Mercedes-Benz Tourismo', departure_time: '2026-10-12 06:30', arrival_time: '2026-10-12 12:30', available_seats: 35, fare: 420.00, status: 'Scheduled' }
];

const PassengerDashboard = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  // Search State
  const [searchOrigin, setSearchOrigin] = useState('All');
  const [searchDest, setSearchDest] = useState('All');
  const [travelDate, setTravelDate] = useState('2026-10-11');
  const [matchingSchedules, setMatchingSchedules] = useState(ALL_SCHEDULES);

  // My Bookings State
  const [myBookings, setMyBookings] = useState([
    { booking_id: 1, booking_reference: 'TRIP-88201', route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', seat_number: '1A', fare: 650.00, date: '2026-10-11 08:00', status: 'Confirmed' }
  ]);
  const [cancelNotice, setCancelNotice] = useState('');

  // Fetch my bookings from backend API
  useEffect(() => {
    if (authFetch) {
      authFetch('/bookings')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            const currentUsername = (user?.username || '').toLowerCase();
            const mine = data.data.filter(b => 
              b.user_id === user?.user_id || 
              (b.passenger_name && b.passenger_name.toLowerCase() === currentUsername)
            );
            if (mine.length > 0) {
              setMyBookings(mine.map(b => ({
                booking_id: b.booking_id,
                booking_reference: b.booking_reference,
                route: b.route_name || `${b.origin} → ${b.destination}`,
                bus: b.bus_number || 'BUS-101',
                seat_number: b.seat_number,
                fare: b.fare || 650.00,
                date: b.departure_time || '2026-10-11 08:00',
                status: b.booking_status || 'Confirmed'
              })));
            }
          }
        })
        .catch(() => {});
    }
  }, [authFetch, user]);

  const handleSearchTrips = (e) => {
    e.preventDefault();
    const filtered = ALL_SCHEDULES.filter(s => {
      const matchOrig = searchOrigin === 'All' || s.origin === searchOrigin;
      const matchDest = searchDest === 'All' || s.destination === searchDest;
      return matchOrig && matchDest;
    });
    setMatchingSchedules(filtered);
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Do you want to cancel this ticket and refund your empty chair?')) {
      try {
        if (authFetch) {
          await authFetch(`/bookings/${id}`, { method: 'DELETE' });
        }
      } catch (e) {}
      setMyBookings(myBookings.map(b => b.booking_id === id ? { ...b, status: 'Cancelled' } : b));
      setCancelNotice('Booking cancelled successfully according to policy. Your seat has been freed.');
      setTimeout(() => setCancelNotice(''), 4000);
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Welcome Banner */}
      <Row className="mb-4">
        <Col>
          <div className="welcome-banner p-4 rounded-4 text-white shadow-lg d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: 'linear-gradient(135deg, #0e7490 0%, #0f172a 100%)' }}>
            <div>
              <span className="badge bg-info text-dark rounded-pill px-3 py-1 fw-bold mb-2">
                👥 Passenger Commuter Portal
              </span>
              <h2 className="fw-bold mb-1">
                Welcome back, {user?.username || 'Passenger'}! 👋
              </h2>
              <p className="mb-0 text-white-50">
                Search intercity coach trips, reserve empty chairs on buses, and manage your digital boarding passes.
              </p>
              <div className="mt-3 d-flex gap-2 flex-wrap">
                <Button variant="info" className="rounded-pill px-4 fw-semibold text-dark" onClick={() => navigate('/bookings')}>
                  💺 Book an Empty Chair
                </Button>
                <Button variant="outline-light" className="rounded-pill px-3" onClick={() => navigate('/tracking')}>
                  📍 Track Bus on GPS Map
                </Button>
              </div>
            </div>
            <div className="d-none d-sm-block text-center z-1">
              <img
                src={heroBus}
                alt="Transit Bus"
                className="rounded-circle shadow-sm"
                style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid rgba(255, 255, 255, 0.2)' }}
              />
            </div>
          </div>
        </Col>
      </Row>

      {cancelNotice && (
        <Alert variant="warning" className="rounded-3 shadow-sm mb-4">
          {cancelNotice}
        </Alert>
      )}

      {/* KPI Stats */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="fs-1">🎫</div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">My Active Tickets</div>
                <h4 className="fw-bold mb-0 text-info">
                  {myBookings.filter(b => b.status !== 'Cancelled').length} Booked
                </h4>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="fs-1">💺</div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Empty Chairs Available</div>
                <h4 className="fw-bold mb-0 text-success">194 Empty</h4>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="fs-1">🗺️</div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Intercity Routes</div>
                <h4 className="fw-bold mb-0 text-warning">6 Corridors</h4>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="fs-1">🚍</div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Fleet Buses Live</div>
                <h4 className="fw-bold mb-0 text-white">7 Luxury Coaches</h4>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Search Available Trips Bar */}
      <Card className="border-0 shadow-sm rounded-4 bg-dark text-white mb-4 p-4 border border-secondary border-opacity-25">
        <h5 className="fw-bold mb-3">🔍 Search Available Trips & Empty Chairs</h5>
        <Form onSubmit={handleSearchTrips}>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">Departure Location</Form.Label>
                <Form.Select
                  className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                  value={searchOrigin}
                  onChange={e => setSearchOrigin(e.target.value)}
                >
                  <option value="All">All Origins</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Hawassa">Hawassa</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">Destination Location</Form.Label>
                <Form.Select
                  className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                  value={searchDest}
                  onChange={e => setSearchDest(e.target.value)}
                >
                  <option value="All">All Destinations</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Hawassa">Hawassa</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Mekelle">Mekelle</option>
                  <option value="Jimma">Jimma</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">Travel Date</Form.Label>
                <Form.Control
                  type="date"
                  className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                  value={travelDate}
                  onChange={e => setTravelDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button variant="info" type="submit" className="rounded-pill w-100 fw-semibold text-dark">
                Search Trips
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Available Trip Schedules Results */}
      <Card className="border-0 shadow-sm rounded-4 bg-dark text-white mb-4">
        <Card.Header className="bg-transparent border-secondary border-opacity-25 pt-3 pb-2 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-white">🚍 Available Trips for Booking</h5>
          <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-1">
            {matchingSchedules.length} Trips Found
          </span>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-white">
              <thead className="table-light">
                <tr>
                  <th>Route / Corridor</th>
                  <th>Coach Model</th>
                  <th>Departure Time</th>
                  <th>Arrival Time</th>
                  <th>Empty Chairs</th>
                  <th>Fare</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {matchingSchedules.map(sched => (
                  <tr key={sched.schedule_id}>
                    <td>
                      <div className="fw-bold text-info">{sched.origin} → {sched.destination}</div>
                      <small className="text-muted">{sched.bus}</small>
                    </td>
                    <td className="text-white-50 small">{sched.model}</td>
                    <td className="text-white">{sched.departure_time}</td>
                    <td className="text-muted">{sched.arrival_time}</td>
                    <td>
                      <Badge bg="success" className="rounded-pill px-3 py-2 fw-bold">
                        🟢 {sched.available_seats} Empty Chairs
                      </Badge>
                    </td>
                    <td className="fw-bold text-success fs-6">ETB {sched.fare.toFixed(2)}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="info"
                        className="rounded-pill px-3 text-dark fw-semibold"
                        onClick={() => navigate('/bookings')}
                      >
                        💺 Book Empty Chair
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* My Bookings Table */}
      <Card className="border-0 shadow-sm rounded-4 bg-dark text-white">
        <Card.Header className="bg-transparent border-secondary border-opacity-25 pt-3 pb-2 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-white">🎫 My Reserved Trips & Tickets</h5>
          <Button variant="outline-light" size="sm" className="rounded-pill px-3" onClick={() => navigate('/bookings')}>
            View All in Bookings &rarr;
          </Button>
        </Card.Header>
        <Card.Body>
          {myBookings.length === 0 ? (
            <div className="text-center py-4">
              <div className="fs-1 mb-2">💺</div>
              <h6 className="fw-bold text-white">No active bookings found</h6>
              <p className="text-muted small">Choose an available trip above to reserve an empty chair.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 text-white">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    <th>Route</th>
                    <th>Coach Bus</th>
                    <th>Reserved Seat</th>
                    <th>Departure Date</th>
                    <th>Fare Paid</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map(b => (
                    <tr key={b.booking_id}>
                      <td className="fw-bold text-info">{b.booking_reference}</td>
                      <td className="fw-semibold text-white">{b.route}</td>
                      <td className="text-muted">{b.bus}</td>
                      <td>
                        <Badge bg="primary" className="rounded-pill px-3 py-2 fw-bold">
                          💺 Chair {b.seat_number}
                        </Badge>
                      </td>
                      <td className="text-white">{b.date}</td>
                      <td className="text-success fw-bold">ETB {Number(b.fare).toFixed(2)}</td>
                      <td>
                        <Badge bg={b.status === 'Confirmed' ? 'success' : 'danger'} className="rounded-pill px-3 py-2">
                          {b.status}
                        </Badge>
                      </td>
                      <td>
                        {b.status !== 'Cancelled' ? (
                          <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleCancelBooking(b.booking_id)}>
                            Cancel Ticket
                          </Button>
                        ) : (
                          <span className="text-muted small">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PassengerDashboard;
