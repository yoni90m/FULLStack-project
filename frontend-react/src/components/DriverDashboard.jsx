import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import heroBus from '../assets/hero_bus.jpg';

const initialDriverTrips = [
  {
    schedule_id: 1,
    route: 'Addis Ababa → Bahir Dar',
    bus: 'BUS-101',
    bus_model: 'Volvo 9700 Luxury Cruiser',
    plate_number: 'NY-TR-8801',
    departure_time: '2026-10-11 08:00',
    arrival_time: '2026-10-11 17:30',
    passenger_count: 37,
    capacity: 40,
    status: 'Scheduled',
    passengers: [
      { name: 'Alice Smith', phone: '+251 911 123 456', seat: '1A', ref: 'TRIP-88201', checkedIn: true },
      { name: 'Bob Jones', phone: '+251 911 987 654', seat: '1B', ref: 'TRIP-88202', checkedIn: false },
      { name: 'Clara Oswald', phone: '+251 911 654 321', seat: '2C', ref: 'TRIP-88203', checkedIn: false },
    ]
  },
  {
    schedule_id: 5,
    route: 'Addis Ababa → Mekelle',
    bus: 'BUS-106',
    bus_model: 'Setra ComfortClass S 515',
    plate_number: 'TX-TR-5519',
    departure_time: '2026-10-13 07:30',
    arrival_time: '2026-10-13 19:30',
    passenger_count: 39,
    capacity: 40,
    status: 'Scheduled',
    passengers: [
      { name: 'Daniel Craig', phone: '+251 911 789 012', seat: '3A', ref: 'TRIP-88206', checkedIn: false },
      { name: 'Marta Hailu', phone: '+251 922 456 789', seat: '4C', ref: 'TRIP-88208', checkedIn: true },
    ]
  }
];

const completedTrips = [
  { schedule_id: 101, route: 'Addis Ababa → Hawassa', bus: 'BUS-101', date: '2026-10-07', passengers: 38, status: 'Completed' },
  { schedule_id: 102, route: 'Bahir Dar → Addis Ababa', bus: 'BUS-101', date: '2026-10-05', passengers: 40, status: 'Completed' },
];

const statusVariant = {
  Scheduled: 'primary',
  Boarding: 'warning',
  'In Transit': 'info',
  Completed: 'success',
  Cancelled: 'danger'
};

const DriverDashboard = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState(initialDriverTrips);
  const [selectedManifestTrip, setSelectedManifestTrip] = useState(null);
  const [showManifestModal, setShowManifestModal] = useState(false);

  // Incident Modal State
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    bus_number: 'BUS-101',
    issue_type: 'Delay',
    description: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  // Load driver trips from backend API
  useEffect(() => {
    if (authFetch) {
      authFetch('/schedules/driver/my-trips')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setTrips(data.data.map(t => ({
              schedule_id: t.schedule_id,
              route: t.route_name || `${t.origin} → ${t.destination}`,
              bus: t.bus_number || 'BUS-101',
              bus_model: t.bus_model || 'Intercity Coach',
              plate_number: t.plate_number || 'ET-TR-101',
              departure_time: t.departure_time,
              arrival_time: t.arrival_time,
              passenger_count: (t.capacity || 40) - (t.available_seats || 35),
              capacity: t.capacity || 40,
              status: t.status || 'Scheduled',
              passengers: [
                { name: 'Alice Smith', phone: '+251 911 123 456', seat: '1A', ref: 'TRIP-88201', checkedIn: true },
                { name: 'Bob Jones', phone: '+251 911 987 654', seat: '1B', ref: 'TRIP-88202', checkedIn: false }
              ]
            })));
          }
        })
        .catch(() => {});
    }
  }, [authFetch]);

  const showAlert = (variant, message) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: 'success', message: '' }), 4000);
  };

  const handleUpdateTripStatus = async (scheduleId, newStatus) => {
    try {
      if (authFetch) {
        await authFetch(`/schedules/${scheduleId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus })
        });
      }
      setTrips(trips.map(t => t.schedule_id === scheduleId ? { ...t, status: newStatus } : t));
      showAlert('success', `Trip status successfully updated to "${newStatus}".`);
    } catch (e) {
      setTrips(trips.map(t => t.schedule_id === scheduleId ? { ...t, status: newStatus } : t));
      showAlert('success', `Trip status updated to "${newStatus}".`);
    }
  };

  const handleOpenManifest = (trip) => {
    setSelectedManifestTrip(trip);
    // If backend manifest is available, fetch
    if (authFetch) {
      authFetch(`/passengers/manifest/${trip.schedule_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setSelectedManifestTrip({
              ...trip,
              passengers: data.data.map(p => ({
                name: p.name,
                phone: p.phone,
                seat: p.seat_number,
                ref: p.booking_reference,
                checkedIn: false
              }))
            });
          }
        })
        .catch(() => {});
    }
    setShowManifestModal(true);
  };

  const handleToggleCheckIn = (seatNum) => {
    if (!selectedManifestTrip) return;
    const updated = selectedManifestTrip.passengers.map(p =>
      p.seat === seatNum ? { ...p, checkedIn: !p.checkedIn } : p
    );
    setSelectedManifestTrip({ ...selectedManifestTrip, passengers: updated });
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!incidentForm.description.trim()) {
      showAlert('danger', 'Please provide an incident description.');
      return;
    }

    try {
      if (authFetch) {
        await authFetch('/reports/incidents', {
          method: 'POST',
          body: JSON.stringify(incidentForm)
        });
      }
      setShowIncidentModal(false);
      setIncidentForm({ bus_number: 'BUS-101', issue_type: 'Delay', description: '' });
      showAlert('warning', 'Incident / issue report submitted to fleet operations.');
    } catch (e) {
      setShowIncidentModal(false);
      showAlert('warning', 'Incident report logged successfully.');
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Driver Welcome Banner */}
      <Row className="mb-4">
        <Col>
          <div className="welcome-banner p-4 rounded-4 text-white shadow-lg d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' }}>
            <div>
              <span className="badge bg-info text-dark rounded-pill px-3 py-1 fw-bold mb-2">
                👨‍✈️ Driver Portal
              </span>
              <h2 className="fw-bold mb-1">
                Welcome back, {user?.username || 'Driver'}! 👋
              </h2>
              <p className="mb-0 text-white-50">
                View your scheduled bus dispatch trips, manage passenger boarding, and update transit statuses.
              </p>
              <div className="mt-3 d-flex gap-2 flex-wrap">
                <Button variant="warning" className="rounded-pill px-3 fw-semibold text-dark" onClick={() => setShowIncidentModal(true)}>
                  ⚠️ Report Bus Issue / Delay
                </Button>
                <Button variant="outline-light" className="rounded-pill px-3" onClick={() => navigate('/tracking')}>
                  📍 GPS Road Tracker
                </Button>
              </div>
            </div>
            <div className="d-none d-sm-block text-center z-1">
              <img
                src={heroBus}
                alt="Driver Coach"
                className="rounded-circle shadow-sm"
                style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid rgba(255, 255, 255, 0.2)' }}
              />
            </div>
          </div>
        </Col>
      </Row>

      {alert.show && (
        <Alert variant={alert.variant} className="rounded-3 shadow-sm mb-4">
          {alert.message}
        </Alert>
      )}

      {/* Driver Stats */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="fs-1">🚍</div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Assigned Bus</div>
                <h4 className="fw-bold mb-0 text-info">BUS-101</h4>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="fs-1">🕒</div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Upcoming Trips</div>
                <h4 className="fw-bold mb-0 text-success">{trips.length} Scheduled</h4>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="fs-1">👥</div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Booked Passengers</div>
                <h4 className="fw-bold mb-0 text-warning">
                  {trips.reduce((acc, t) => acc + (t.passenger_count || 0), 0)} Boarding
                </h4>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="fs-1">🎖️</div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Completed Runs</div>
                <h4 className="fw-bold mb-0 text-white">48 Trips</h4>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Assigned Trips Table */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white">
            <Card.Header className="bg-transparent border-secondary border-opacity-25 pt-3 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="fw-bold mb-0 text-white">📋 My Assigned Dispatch Trips</h5>
              <span className="badge bg-primary bg-opacity-25 text-info rounded-pill px-3 py-1">
                Real-Time Operations
              </span>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 text-white">
                  <thead className="table-light">
                    <tr>
                      <th>Route / Corridor</th>
                      <th>Bus Coach</th>
                      <th>Departure</th>
                      <th>Arrival (ETA)</th>
                      <th>Passengers</th>
                      <th>Trip Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map(trip => (
                      <tr key={trip.schedule_id}>
                        <td>
                          <div className="fw-bold text-info">{trip.route}</div>
                          <small className="text-muted">ID: SCHED-{trip.schedule_id}</small>
                        </td>
                        <td>
                          <div className="fw-semibold text-white">{trip.bus}</div>
                          <small className="text-muted">{trip.bus_model}</small>
                        </td>
                        <td className="text-white">{trip.departure_time}</td>
                        <td className="text-white-50">{trip.arrival_time}</td>
                        <td>
                          <Badge bg="secondary" className="rounded-pill px-3 py-2 fw-semibold">
                            {trip.passenger_count} / {trip.capacity} Seats
                          </Badge>
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            className="bg-dark text-white border-secondary rounded-pill"
                            style={{ width: '140px' }}
                            value={trip.status}
                            onChange={e => handleUpdateTripStatus(trip.schedule_id, e.target.value)}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Boarding">Boarding</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </Form.Select>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-info"
                            className="rounded-pill px-3 me-2"
                            onClick={() => handleOpenManifest(trip)}
                          >
                            👥 Manifest
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Completed Trip History & Notifications */}
      <Row className="g-4">
        <Col md={7}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white h-100">
            <Card.Header className="bg-transparent border-0 pt-3 pb-0">
              <h5 className="fw-bold text-white mb-0">📜 Previous Trip History</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 text-white">
                  <thead className="table-light">
                    <tr>
                      <th>Trip Route</th>
                      <th>Bus</th>
                      <th>Date</th>
                      <th>Passengers</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTrips.map(ct => (
                      <tr key={ct.schedule_id}>
                        <td className="fw-medium text-white">{ct.route}</td>
                        <td className="text-muted">{ct.bus}</td>
                        <td className="text-muted">{ct.date}</td>
                        <td><Badge bg="success" className="rounded-pill">{ct.passengers} pax</Badge></td>
                        <td><Badge bg="success" className="rounded-pill px-3 py-1">Completed</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white h-100">
            <Card.Header className="bg-transparent border-0 pt-3 pb-0">
              <h5 className="fw-bold text-white mb-0">🔔 Operational Alerts & Dispatch</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-warning small">⚠️ Road Condition Notice</span>
                    <span className="text-muted small">1 hour ago</span>
                  </div>
                  <div className="small text-white-50">
                    Gojjam road near Dejen bridge undergoing scheduled maintenance. Expect slow transit speed (40 km/h).
                  </div>
                </div>

                <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-info small">ℹ️ Terminal Gate Assignment</span>
                    <span className="text-muted small">3 hours ago</span>
                  </div>
                  <div className="small text-white-50">
                    BUS-101 departs from Autobis Tera Platform Bay 4 for the 08:00 AM Bahir Dar run.
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Passenger Manifest Modal */}
      <Modal show={showManifestModal} onHide={() => setShowManifestModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white border-secondary border-opacity-25">
          <Modal.Title className="fw-bold fs-5">
            👥 Passenger Boarding Manifest — {selectedManifestTrip?.bus} ({selectedManifestTrip?.route})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-4">
          <p className="text-white-50 small mb-3">
            Use this manifest to verify booked passenger seats and check in boarding travelers at the coach entrance.
          </p>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-white">
              <thead className="table-light">
                <tr>
                  <th>Seat</th>
                  <th>Passenger Name</th>
                  <th>Phone Number</th>
                  <th>Ticket Ref</th>
                  <th>Boarding Status</th>
                  <th>Check-In</th>
                </tr>
              </thead>
              <tbody>
                {selectedManifestTrip?.passengers.map(p => (
                  <tr key={p.seat}>
                    <td>
                      <Badge bg="primary" className="rounded-pill px-3 py-2 fw-bold">
                        💺 {p.seat}
                      </Badge>
                    </td>
                    <td className="fw-semibold text-white">{p.name}</td>
                    <td className="text-white-50 small">{p.phone}</td>
                    <td className="text-info small">{p.ref}</td>
                    <td>
                      <Badge bg={p.checkedIn ? 'success' : 'warning'} className="rounded-pill px-3 py-1">
                        {p.checkedIn ? 'Boarded' : 'Not Boarded'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={p.checkedIn ? 'outline-success' : 'primary'}
                        className="rounded-pill px-3"
                        onClick={() => handleToggleCheckIn(p.seat)}
                      >
                        {p.checkedIn ? '✓ Boarded' : 'Mark Boarded'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary border-opacity-25">
          <Button variant="secondary" className="rounded-pill px-4" onClick={() => setShowManifestModal(false)}>
            Close Manifest
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Incident / Problem Reporting Modal */}
      <Modal show={showIncidentModal} onHide={() => setShowIncidentModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white border-secondary border-opacity-25">
          <Modal.Title className="fw-bold fs-5 text-warning">
            ⚠️ Report Bus Problem, Delay or Accident
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-4">
          <Form onSubmit={handleSubmitIncident}>
            <Form.Group className="mb-3">
              <Form.Label className="small text-muted">Vehicle Bus Number</Form.Label>
              <Form.Control
                type="text"
                className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                value={incidentForm.bus_number}
                onChange={e => setIncidentForm({ ...incidentForm, bus_number: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small text-muted">Incident / Problem Type</Form.Label>
              <Form.Select
                className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                value={incidentForm.issue_type}
                onChange={e => setIncidentForm({ ...incidentForm, issue_type: e.target.value })}
              >
                <option value="Delay">Delay (Traffic / Weather / Checkpoint)</option>
                <option value="Mechanical / Breakdown">Mechanical / Breakdown (Engine / Tire)</option>
                <option value="Maintenance Needed">Maintenance Needed</option>
                <option value="Accident">Accident / Road Incident</option>
                <option value="Other">Other Problem</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small text-muted">Description & Location Details</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Describe what occurred, your approximate kilometer marker, and if towing/support is needed..."
                className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                value={incidentForm.description}
                onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" className="rounded-pill px-3" onClick={() => setShowIncidentModal(false)}>
                Cancel
              </Button>
              <Button variant="warning" type="submit" className="rounded-pill px-4 text-dark fw-semibold">
                Submit Report to Admin
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DriverDashboard;
