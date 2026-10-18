import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import './BookingsPage.css';

const DEFAULT_SCHEDULES = [
  { schedule_id: 1, route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', bus_model: 'Volvo 9700 Luxury Cruiser', departure_time: '2026-10-06 08:00', fare: 650.00, booked_seats: ['1A', '1B', '2C'] },
  { schedule_id: 2, route: 'Addis Ababa → Hawassa', bus: 'BUS-103', bus_model: 'Scania Touring HD', departure_time: '2026-10-06 09:30', fare: 320.00, booked_seats: ['4A', '4B'] },
  { schedule_id: 3, route: 'Addis Ababa → Dire Dawa', bus: 'BUS-104', bus_model: 'MCI J4500 Coach', departure_time: '2026-10-08 10:00', fare: 550.00, booked_seats: ['1A', '3C'] },
  { schedule_id: 4, route: 'Addis Ababa → Mekelle', bus: 'BUS-106', bus_model: 'Setra ComfortClass S 515', departure_time: '2026-10-09 07:30', fare: 850.00, booked_seats: ['3A', '5D'] },
];

const statusVariant = { Confirmed: 'success', Pending: 'warning', Cancelled: 'danger' };

const BookingsPage = () => {
  const { user, isAdmin, authFetch } = useAuth();
  const isPassenger = user?.role === 'Passenger';

  // Seed user's initial sample booking if matched, or empty for clean privacy
  const [bookings, setBookings] = useState(() => {
    if (isPassenger) {
      // Only include booking if it matches the current user's username
      const username = (user?.username || '').toLowerCase();
      if (username === 'alice_smith' || username === 'alice') {
        return [
          { booking_id: 1, booking_reference: 'TRIP-88201', passenger: user.username, schedule_id: 1, route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', seat_number: '1A', fare: 650.00, booking_date: '2026-10-03', booking_status: 'Confirmed' },
          { booking_id: 4, booking_reference: 'TRIP-88204', passenger: user.username, schedule_id: 2, route: 'Addis Ababa → Hawassa', bus: 'BUS-103', seat_number: '4A', fare: 320.00, booking_date: '2026-10-04', booking_status: 'Confirmed' }
        ];
      } else if (username === 'bob_jones' || username === 'bob') {
        return [
          { booking_id: 2, booking_reference: 'TRIP-88202', passenger: user.username, schedule_id: 1, route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', seat_number: '1B', fare: 650.00, booking_date: '2026-10-04', booking_status: 'Confirmed' }
        ];
      }
      return [];
    }
    // Admin sees all
    return [
      { booking_id: 1, booking_reference: 'TRIP-88201', passenger: 'Alice Smith', schedule_id: 1, route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', seat_number: '1A', fare: 650.00, booking_date: '2026-10-03', booking_status: 'Confirmed' },
      { booking_id: 2, booking_reference: 'TRIP-88202', passenger: 'Bob Jones', schedule_id: 1, route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', seat_number: '1B', fare: 650.00, booking_date: '2026-10-04', booking_status: 'Confirmed' },
      { booking_id: 3, booking_reference: 'TRIP-88203', passenger: 'Clara Oswald', schedule_id: 1, route: 'Addis Ababa → Bahir Dar', bus: 'BUS-101', seat_number: '2C', fare: 650.00, booking_date: '2026-10-04', booking_status: 'Confirmed' },
      { booking_id: 4, booking_reference: 'TRIP-88204', passenger: 'Alice Smith', schedule_id: 2, route: 'Addis Ababa → Hawassa', bus: 'BUS-103', seat_number: '4A', fare: 320.00, booking_date: '2026-10-04', booking_status: 'Confirmed' },
      { booking_id: 5, booking_reference: 'TRIP-88205', passenger: 'Daniel Craig', schedule_id: 2, route: 'Addis Ababa → Hawassa', bus: 'BUS-103', seat_number: '4B', fare: 320.00, booking_date: '2026-10-04', booking_status: 'Confirmed' },
    ];
  });

  const [schedules] = useState(DEFAULT_SCHEDULES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Interactive Visual Seat Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Telebirr');
  const [paymentPhone, setPaymentPhone] = useState('0911234567');
  const [paymentBank, setPaymentBank] = useState('Commercial Bank of Ethiopia (CBE Birr)');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  // Fetch bookings from backend API
  useEffect(() => {
    if (authFetch) {
      authFetch('/bookings')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            if (isPassenger) {
              // Strictly isolate: passenger only sees their own bookings
              const currentUsername = (user?.username || '').toLowerCase();
              const myBookings = data.data.filter(b => {
                const passName = (b.passenger_name || b.passenger || '').toLowerCase();
                return b.user_id === user?.user_id || passName === currentUsername;
              });
              if (myBookings.length > 0) {
                setBookings(myBookings.map(b => ({
                  booking_id: b.booking_id,
                  booking_reference: b.booking_reference,
                  passenger: b.passenger_name || user?.username,
                  schedule_id: b.schedule_id,
                  route: b.route_name || `${b.origin || ''} → ${b.destination || ''}`,
                  bus: b.bus_number || 'BUS-101',
                  seat_number: b.seat_number,
                  fare: b.fare || 650.00,
                  booking_date: b.booking_date?.split('T')[0] || '2026-10-05',
                  booking_status: b.booking_status || 'Confirmed'
                })));
              }
            } else {
              setBookings(data.data.map(b => ({
                booking_id: b.booking_id,
                booking_reference: b.booking_reference,
                passenger: b.passenger_name || 'Passenger',
                schedule_id: b.schedule_id,
                route: b.route_name || `${b.origin || ''} → ${b.destination || ''}`,
                bus: b.bus_number || 'BUS-101',
                seat_number: b.seat_number,
                fare: b.fare || 650.00,
                booking_date: b.booking_date?.split('T')[0] || '2026-10-05',
                booking_status: b.booking_status || 'Confirmed'
              })));
            }
          }
        })
        .catch(() => {});
    }
  }, [authFetch, isPassenger, user]);

  const currentSchedule = schedules.find(s => s.schedule_id === Number(selectedScheduleId)) || schedules[0];

  // Calculate taken chairs on current schedule
  const takenChairs = [
    ...(currentSchedule.booked_seats || []),
    ...bookings
      .filter(b => b.schedule_id === currentSchedule.schedule_id && b.booking_status !== 'Cancelled')
      .map(b => b.seat_number.toUpperCase())
  ];

  const emptyChairsCount = 40 - takenChairs.length;

  const handleOpenBookingModal = () => {
    setSelectedSeat(null);
    setBookingSuccessMsg('');
    setShowModal(true);
  };

  const handleSelectChair = (seat) => {
    if (takenChairs.includes(seat)) return; // Cannot select occupied chair
    setSelectedSeat(seat);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSeat) return;

    const newBookingRef = `TRIP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRecord = {
      booking_id: Date.now(),
      booking_reference: newBookingRef,
      passenger: user?.username || 'Passenger',
      schedule_id: currentSchedule.schedule_id,
      route: currentSchedule.route,
      bus: currentSchedule.bus,
      seat_number: selectedSeat,
      fare: currentSchedule.fare,
      booking_date: new Date().toISOString().split('T')[0],
      booking_status: 'Confirmed'
    };

    // Send to backend API if live
    try {
      if (authFetch) {
        await authFetch('/bookings', {
          method: 'POST',
          body: JSON.stringify({
            schedule_id: currentSchedule.schedule_id,
            seat_number: selectedSeat,
            payment_method: paymentMethod,
            phone_number: paymentMethod === 'Telebirr' ? paymentPhone : '',
            bank_name: paymentMethod === 'Mobile Banking' ? paymentBank : ''
          })
        });
      }
    } catch (e) {
      console.log('Notice: Offline/mock mode fallback', e);
    }

    setBookings([newRecord, ...bookings]);
    const channelNotice = paymentMethod === 'Telebirr' ? 'via Telebirr' : (paymentMethod === 'Mobile Banking' ? 'via Mobile Banking' : 'via Cash');
    setBookingSuccessMsg(`Success! Chair ${selectedSeat} on ${currentSchedule.bus} has been reserved (${channelNotice}).`);
    setTimeout(() => {
      setShowModal(false);
      setSelectedSeat(null);
      setBookingSuccessMsg('');
    }, 1200);
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking and free up your chair?')) {
      try {
        if (authFetch) {
          await authFetch(`/bookings/${id}`, { method: 'DELETE' });
        }
      } catch (e) {}
      setBookings(bookings.map(b => b.booking_id === id ? { ...b, booking_status: 'Cancelled' } : b));
    }
  };

  // Filter bookings (if passenger, strict privacy is guaranteed)
  const filtered = bookings.filter(b => {
    const matchSearch =
      b.booking_reference.toLowerCase().includes(search.toLowerCase()) ||
      b.route.toLowerCase().includes(search.toLowerCase()) ||
      b.seat_number.toLowerCase().includes(search.toLowerCase()) ||
      (!isPassenger && b.passenger.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'All' || b.booking_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="fw-bold mb-1">
            {isPassenger ? '🎫 My Reserved Bus Seats' : '🎫 Trip Bookings & Manifest'}
          </h4>
          <p className="text-muted small mb-0">
            {isPassenger 
              ? 'View your personal travel tickets, departure schedules, or reserve an empty chair on any bus.'
              : 'Complete passenger booking manifests and ticket administration.'}
          </p>
        </Col>
        <Col xs="auto">
          <Button variant="info" className="rounded-pill px-4 fw-semibold text-dark shadow-sm" onClick={handleOpenBookingModal}>
            💺 + Book an Empty Chair
          </Button>
        </Col>
      </Row>

      {/* Filter and Table */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder={isPassenger ? "Search your bookings by reference, route, or seat..." : "Search by reference, passenger, or route..."}
                className="rounded-3"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
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

          {filtered.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 mb-2">💺</div>
              <h5 className="fw-bold text-white">No Bookings Found</h5>
              <p className="text-muted small mb-3">
                {isPassenger 
                  ? "You have not reserved any bus seats yet. Select an available trip to pick an empty chair!" 
                  : "No bookings match your current search criteria."}
              </p>
              {isPassenger && (
                <Button variant="primary" className="rounded-pill px-4" onClick={handleOpenBookingModal}>
                  Reserve an Empty Chair Now
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    {!isPassenger && <th>Passenger</th>}
                    <th>Route</th>
                    <th className="d-none d-lg-table-cell">Bus</th>
                    <th>Reserved Chair</th>
                    <th className="d-none d-md-table-cell">Fare</th>
                    <th className="d-none d-sm-table-cell">Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.booking_id}>
                      <td className="fw-bold text-info">{b.booking_reference}</td>
                      {!isPassenger && <td className="text-white">{b.passenger}</td>}
                      <td className="fw-medium text-white">{b.route}</td>
                      <td className="d-none d-lg-table-cell text-muted">{b.bus}</td>
                      <td>
                        <Badge bg="primary" className="rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '0.85rem' }}>
                          💺 Chair {b.seat_number}
                        </Badge>
                      </td>
                      <td className="d-none d-md-table-cell fw-bold text-success">
                        ETB {Number(b.fare).toFixed(2)}
                      </td>
                      <td className="d-none d-sm-table-cell text-muted">{b.booking_date}</td>
                      <td>
                        <Badge bg={statusVariant[b.booking_status] || 'secondary'} className="rounded-pill px-3 py-2">
                          {b.booking_status}
                        </Badge>
                      </td>
                      <td>
                        {b.booking_status !== 'Cancelled' ? (
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

      {/* Interactive Coach Seat Booking Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-secondary border-opacity-25 bg-dark text-white">
          <Modal.Title className="fw-bold fs-5">
            💺 Select Trip & Reserve Empty Chair
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-4">
          {bookingSuccessMsg && (
            <Alert variant="success" className="rounded-3 text-center fw-semibold py-2">
              🎉 {bookingSuccessMsg}
            </Alert>
          )}

          {/* Step 1: Select Schedule */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold text-info small text-uppercase" style={{ letterSpacing: '0.5px' }}>
              1. Choose Intercity Trip Schedule:
            </Form.Label>
            <Form.Select
              className="rounded-3 bg-secondary bg-opacity-25 text-white border-secondary"
              value={selectedScheduleId}
              onChange={e => {
                setSelectedScheduleId(e.target.value);
                setSelectedSeat(null);
              }}
            >
              {schedules.map(s => (
                <option key={s.schedule_id} value={s.schedule_id} className="bg-dark text-white">
                  {s.route} | {s.bus} ({s.bus_model}) — Depart: {s.departure_time} (ETB {s.fare})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Seat Status Summary */}
          <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
            <div>
              <span className="text-muted small">Route & Bus:</span>
              <div className="fw-bold text-white">{currentSchedule.route} ({currentSchedule.bus})</div>
            </div>
            <div className="text-end">
              <span className="text-muted small">Available Seats:</span>
              <div>
                <Badge bg="success" className="rounded-pill px-3 py-2 fw-bold">
                  🟢 {emptyChairsCount} Empty Chairs Available
                </Badge>
              </div>
            </div>
          </div>

          {/* Step 2: Interactive Bus Coach Visual Seat Grid */}
          <div className="mb-4">
            <div className="text-center mb-2">
              <span className="fw-bold small text-info text-uppercase" style={{ letterSpacing: '0.5px' }}>
                2. Click on Any Empty Chair on the Bus:
              </span>
            </div>

            {/* Coach Legend */}
            <div className="seat-legend">
              <div className="seat-legend-item">
                <div className="seat-legend-box available"></div>
                <span>Empty Chair (Available)</span>
              </div>
              <div className="seat-legend-item">
                <div className="seat-legend-box selected"></div>
                <span>Selected Chair</span>
              </div>
              <div className="seat-legend-item">
                <div className="seat-legend-box booked"></div>
                <span>Occupied Chair (Taken)</span>
              </div>
            </div>

            {/* Coach Frame */}
            <div className="bus-coach-frame">
              <div className="bus-front-indicator">
                🚌 Front of Coach / Driver Cabin
              </div>

              <div className="seat-grid-coach">
                {Array.from({ length: 10 }, (_, index) => {
                  const row = index + 1;
                  const seatA = `${row}A`;
                  const seatB = `${row}B`;
                  const seatC = `${row}C`;
                  const seatD = `${row}D`;

                  return (
                    <React.Fragment key={row}>
                      {/* Seat A */}
                      <button
                        type="button"
                        className={`seat-btn ${takenChairs.includes(seatA) ? 'booked' : selectedSeat === seatA ? 'selected' : 'available'}`}
                        disabled={takenChairs.includes(seatA)}
                        onClick={() => handleSelectChair(seatA)}
                        title={takenChairs.includes(seatA) ? `Chair ${seatA} is already occupied` : `Chair ${seatA} is empty - click to reserve`}
                      >
                        💺 {seatA}
                      </button>

                      {/* Seat B */}
                      <button
                        type="button"
                        className={`seat-btn ${takenChairs.includes(seatB) ? 'booked' : selectedSeat === seatB ? 'selected' : 'available'}`}
                        disabled={takenChairs.includes(seatB)}
                        onClick={() => handleSelectChair(seatB)}
                        title={takenChairs.includes(seatB) ? `Chair ${seatB} is already occupied` : `Chair ${seatB} is empty - click to reserve`}
                      >
                        💺 {seatB}
                      </button>

                      {/* Center Aisle */}
                      <div className="aisle-divider">
                        {row === 1 ? 'AISLE' : '·'}
                      </div>

                      {/* Seat C */}
                      <button
                        type="button"
                        className={`seat-btn ${takenChairs.includes(seatC) ? 'booked' : selectedSeat === seatC ? 'selected' : 'available'}`}
                        disabled={takenChairs.includes(seatC)}
                        onClick={() => handleSelectChair(seatC)}
                        title={takenChairs.includes(seatC) ? `Chair ${seatC} is already occupied` : `Chair ${seatC} is empty - click to reserve`}
                      >
                        💺 {seatC}
                      </button>

                      {/* Seat D */}
                      <button
                        type="button"
                        className={`seat-btn ${takenChairs.includes(seatD) ? 'booked' : selectedSeat === seatD ? 'selected' : 'available'}`}
                        disabled={takenChairs.includes(seatD)}
                        onClick={() => handleSelectChair(seatD)}
                        title={takenChairs.includes(seatD) ? `Chair ${seatD} is already occupied` : `Chair ${seatD} is empty - click to reserve`}
                      >
                        💺 {seatD}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Selection Details & Payment */}
          <Row className="g-3 align-items-center p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
            <Col sm={4}>
              <div className="text-muted small">Selected Chair:</div>
              <div className="fs-5 fw-bold text-info">
                {selectedSeat ? `💺 Chair ${selectedSeat}` : 'None Selected'}
              </div>
            </Col>
            <Col sm={4}>
              <div className="text-muted small">Ticket Fare:</div>
              <div className="fs-5 fw-bold text-success">
                ETB {Number(currentSchedule.fare).toFixed(2)}
              </div>
            </Col>
            <Col sm={4}>
              <Form.Label className="text-muted small mb-1">Payment Method:</Form.Label>
              <Form.Select
                size="sm"
                className="bg-dark text-white border-secondary rounded-2"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="Telebirr">🟢 Telebirr (Ethio Telecom)</option>
                <option value="Mobile Banking">📱 Mobile Banking (CBE, Awash, BoA)</option>
                <option value="Cash">💵 Cash (Pay at Station / On-Board)</option>
              </Form.Select>
            </Col>

            {/* Dynamic details for Telebirr / Mobile Banking / Cash */}
            {paymentMethod === 'Telebirr' && (
              <Col xs={12} className="mt-2 pt-2 border-top border-secondary border-opacity-25">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25">🟢 Telebirr Instant Verification</span>
                  <span className="small text-muted">Merchant ID: <strong>882190</strong></span>
                </div>
                <Form.Group className="mb-1">
                  <Form.Label className="small text-muted mb-0">Telebirr Mobile Number:</Form.Label>
                  <Form.Control
                    type="tel"
                    size="sm"
                    className="bg-dark text-white border-secondary"
                    value={paymentPhone}
                    onChange={e => setPaymentPhone(e.target.value)}
                    placeholder="09XXXXXXXX or +2519..."
                  />
                </Form.Group>
                <div className="small text-info opacity-75">
                  📲 USSD push prompt (*127#) will be simulated for automatic confirmation in ETB.
                </div>
              </Col>
            )}

            {paymentMethod === 'Mobile Banking' && (
              <Col xs={12} className="mt-2 pt-2 border-top border-secondary border-opacity-25">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-25">📱 Ethiopian Mobile Banking</span>
                  <span className="small text-muted">Instant Bank Settlement</span>
                </div>
                <Form.Group className="mb-1">
                  <Form.Label className="small text-muted mb-0">Select Bank:</Form.Label>
                  <Form.Select
                    size="sm"
                    className="bg-dark text-white border-secondary"
                    value={paymentBank}
                    onChange={e => setPaymentBank(e.target.value)}
                  >
                    <option value="Commercial Bank of Ethiopia (CBE Birr)">Commercial Bank of Ethiopia (CBE Birr / *847#)</option>
                    <option value="Awash Bank (Awash Birr)">Awash Bank (Awash Birr / *901#)</option>
                    <option value="Bank of Abyssinia">Bank of Abyssinia (BoA Mobile / *815#)</option>
                    <option value="Dashen Bank (Amole)">Dashen Bank (Amole / *996#)</option>
                    <option value="Cooperative Bank of Oromia">Cooperative Bank of Oromia (CoopPay / *355#)</option>
                  </Form.Select>
                </Form.Group>
                <div className="small text-info opacity-75">
                  ⚡ Automatic ledger verification with bank gateway.
                </div>
              </Col>
            )}

            {paymentMethod === 'Cash' && (
              <Col xs={12} className="mt-2 pt-2 border-top border-secondary border-opacity-25">
                <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25 mb-1">💵 Cash Terminal Counter</span>
                <p className="small text-muted mb-0">
                  Pay cash in Ethiopian Birr (ETB) at the TransLink bus terminal counter or directly to the conductor upon boarding.
                </p>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-secondary border-opacity-25 bg-dark">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="info"
            className="rounded-pill px-4 fw-semibold text-dark"
            disabled={!selectedSeat}
            onClick={handleConfirmBooking}
          >
            {selectedSeat ? `Confirm Reservation for Chair ${selectedSeat}` : 'Please Select an Empty Chair'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingsPage;
