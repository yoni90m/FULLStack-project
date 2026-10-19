import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Button, Modal, Nav, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const initialBookedPassengers = [
  { passenger_id: 1, name: 'Alice Smith', phone: '+251 911 123 456', email: 'alice.smith@gmail.com', bus_id: 1, bus_number: 'BUS-101', plate_number: 'NY-TR-8801', route_name: 'Addis Ababa → Bahir Dar', seat_number: '1A', booking_reference: 'TRIP-88201', departure_time: '2026-10-08 08:00', booking_status: 'Confirmed' },
  { passenger_id: 2, name: 'Bob Jones', phone: '+251 911 987 654', email: 'bob.jones@yahoo.com', bus_id: 1, bus_number: 'BUS-101', plate_number: 'NY-TR-8801', route_name: 'Addis Ababa → Bahir Dar', seat_number: '1B', booking_reference: 'TRIP-88202', departure_time: '2026-10-08 08:00', booking_status: 'Confirmed' },
  { passenger_id: 3, name: 'Clara Oswald', phone: '+251 911 654 321', email: 'clara.oswald@outlook.com', bus_id: 1, bus_number: 'BUS-101', plate_number: 'NY-TR-8801', route_name: 'Addis Ababa → Bahir Dar', seat_number: '2C', booking_reference: 'TRIP-88203', departure_time: '2026-10-08 08:00', booking_status: 'Confirmed' },
  { passenger_id: 1, name: 'Alice Smith', phone: '+251 911 123 456', email: 'alice.smith@gmail.com', bus_id: 3, bus_number: 'BUS-103', plate_number: 'CA-TR-1290', route_name: 'Addis Ababa → Hawassa', seat_number: '4A', booking_reference: 'TRIP-88204', departure_time: '2026-10-08 09:30', booking_status: 'Confirmed' },
  { passenger_id: 4, name: 'Daniel Craig', phone: '+251 911 789 012', email: 'daniel.craig@gmail.com', bus_id: 3, bus_number: 'BUS-103', plate_number: 'CA-TR-1290', route_name: 'Addis Ababa → Hawassa', seat_number: '4B', booking_reference: 'TRIP-88205', departure_time: '2026-10-08 09:30', booking_status: 'Confirmed' },
  { passenger_id: 2, name: 'Bob Jones', phone: '+251 911 987 654', email: 'bob.jones@yahoo.com', bus_id: 6, bus_number: 'BUS-106', plate_number: 'TX-TR-5519', route_name: 'Addis Ababa → Mekelle', seat_number: '3A', booking_reference: 'TRIP-88206', departure_time: '2026-10-10 07:30', booking_status: 'Confirmed' },
];

/* ─── Glassmorphism style tokens ─── */
const glassCard = {
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '18px',
};
const glassInput = {
  background: 'rgba(30, 41, 59, 0.6)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f1f5f9',
  borderRadius: '12px',
};

const PassengersPage = () => {
  const { authFetch } = useAuth() || {};

  /* ─── State ─── */
  const [activeTab, setActiveTab] = useState('booked');
  const [passengers, setPassengers] = useState(initialBookedPassengers);
  const [registeredPassengers, setRegisteredPassengers] = useState([]);
  const [search, setSearch] = useState('');
  const [busFilter, setBusFilter] = useState('all');
  const [loadingRegistered, setLoadingRegistered] = useState(false);

  // Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Password Reset Modal state
  const [resetModal, setResetModal] = useState({
    show: false,
    passenger: null,
    mode: 'auto',
    customPassword: '',
    showPassword: false,
    loading: false,
    result: null,
    copied: false,
    error: '',
    success: ''
  });

  /* ─── Fetch booked passengers ─── */
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

  /* ─── Fetch all registered passengers ─── */
  const fetchRegistered = useCallback(() => {
    if (!authFetch) return;
    setLoadingRegistered(true);
    authFetch('/passengers/registered')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setRegisteredPassengers(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRegistered(false));
  }, [authFetch]);

  useEffect(() => {
    if (activeTab === 'registered') {
      fetchRegistered();
    }
  }, [activeTab, fetchRegistered]);

  /* ─── Filter logic ─── */
  const uniqueBuses = Array.from(
    new Map(passengers.filter(p => p.bus_number).map(p => [p.bus_number, p])).values()
  );

  const filteredBooked = passengers.filter(p => {
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

  const filteredRegistered = registeredPassengers.filter(p => {
    const s = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(s) ||
      (p.email || '').toLowerCase().includes(s) ||
      (p.phone || '').toLowerCase().includes(s) ||
      (p.username || '').toLowerCase().includes(s)
    );
  });

  /* ─── Admin register passenger ─── */
  const handleRegFormChange = e => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
    setRegError('');
    setRegSuccess('');
  };

  const validateRegForm = () => {
    const { name, email, phone } = regForm;
    if (!name.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email address is required.';
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format.';
    if (!phone.trim()) return 'Phone number is required.';
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) return 'Invalid phone number format.';
    return null;
  };

  const handleAdminRegister = async e => {
    e.preventDefault();
    const validationError = validateRegForm();
    if (validationError) {
      setRegError(validationError);
      return;
    }
    setRegLoading(true);
    setRegError('');
    setRegSuccess('');
    try {
      const res = await authFetch('/passengers/register', {
        method: 'POST',
        body: JSON.stringify({
          name: regForm.name.trim(),
          email: regForm.email.trim(),
          phone: regForm.phone.trim(),
          username: regForm.username.trim() || undefined,
          password: regForm.password.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }
      const creds = data.data;
      setRegSuccess(
        `✅ Passenger registered! Username: ${creds.username} | Default Password: ${creds.default_password}`
      );
      setRegForm({ name: '', email: '', phone: '', username: '', password: '' });
      // Refresh the registered list
      fetchRegistered();
    } catch (err) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const closeModal = () => {
    setShowRegisterModal(false);
    setRegError('');
    setRegSuccess('');
    setRegForm({ name: '', email: '', phone: '', username: '', password: '' });
  };

  /* ─── Admin Reset Passenger Password ─── */
  const openResetModal = (passenger) => {
    setResetModal({
      show: true,
      passenger,
      mode: 'auto',
      customPassword: '',
      showPassword: false,
      loading: false,
      result: null,
      copied: false,
      error: '',
      success: ''
    });
  };

  const closeResetModal = () => {
    setResetModal({
      show: false,
      passenger: null,
      mode: 'auto',
      customPassword: '',
      showPassword: false,
      loading: false,
      result: null,
      copied: false,
      error: '',
      success: ''
    });
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!resetModal.passenger) return;

    if (resetModal.mode === 'custom') {
      if (!resetModal.customPassword || resetModal.customPassword.trim().length < 6) {
        setResetModal(prev => ({ ...prev, error: 'Custom password must be at least 6 characters long.' }));
        return;
      }
    }

    setResetModal(prev => ({ ...prev, loading: true, error: '', success: '' }));
    try {
      const payload = {
        ...(resetModal.passenger.user_id ? { user_id: resetModal.passenger.user_id } : { identifier: resetModal.passenger.email }),
        ...(resetModal.mode === 'custom' ? { new_password: resetModal.customPassword.trim() } : {})
      };

      const res = await authFetch('/auth/admin/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Password reset failed.');
      }

      setResetModal(prev => ({
        ...prev,
        loading: false,
        result: data.data,
        success: `Password reset successfully for ${resetModal.passenger.name}!`,
        error: ''
      }));
    } catch (err) {
      setResetModal(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to reset password.'
      }));
    }
  };

  const copyCredentials = (username, password) => {
    const text = `Username: ${username}\nNew Password: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
      setResetModal(prev => ({ ...prev, copied: true }));
      setTimeout(() => setResetModal(prev => ({ ...prev, copied: false })), 3000);
    });
  };

  /* ─── Status badge helper ─── */
  const statusBadge = (status) => {
    const map = { Active: 'success', Inactive: 'secondary', Suspended: 'danger' };
    return <Badge bg={map[status] || 'secondary'} className="rounded-pill px-3 py-2">{status || 'Active'}</Badge>;
  };

  return (
    <Container fluid className="p-4">
      {/* ─── Header ─── */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="fw-bold mb-1">👥 Passenger Management</h4>
          <p className="text-muted small mb-0">View booked passengers or manage all registered accounts</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2 align-items-center">
          <Badge bg="primary" className="px-3 py-2 rounded-pill fs-6">
            {activeTab === 'booked' ? filteredBooked.length : filteredRegistered.length} Passengers
          </Badge>
          <Button
            id="btn-register-passenger"
            variant="primary"
            className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-semibold shadow-sm"
            onClick={() => setShowRegisterModal(true)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              fontSize: '0.9rem',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>➕</span> Register Passenger
          </Button>
        </Col>
      </Row>

      {/* ─── Tabs ─── */}
      <Nav variant="pills" className="mb-3 gap-2" activeKey={activeTab} onSelect={setActiveTab}>
        <Nav.Item>
          <Nav.Link
            eventKey="booked"
            id="tab-booked-passengers"
            className="rounded-pill px-4 py-2 fw-semibold"
            style={{
              background: activeTab === 'booked' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(30, 41, 59, 0.5)',
              color: activeTab === 'booked' ? '#fff' : '#94a3b8',
              border: activeTab === 'booked' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.3s ease',
            }}
          >
            🎫 Booked Passengers
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="registered"
            id="tab-registered-passengers"
            className="rounded-pill px-4 py-2 fw-semibold"
            style={{
              background: activeTab === 'registered' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(30, 41, 59, 0.5)',
              color: activeTab === 'registered' ? '#fff' : '#94a3b8',
              border: activeTab === 'registered' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.3s ease',
            }}
          >
            📋 All Registered
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* ─── Content Card ─── */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          {/* Search / Filter Row */}
          <Row className="g-2 mb-3">
            <Col md={activeTab === 'booked' ? 8 : 12}>
              <Form.Control
                id="input-passenger-search"
                type="text"
                placeholder={activeTab === 'booked'
                  ? "Search by passenger name, bus, ticket reference, or route..."
                  : "Search by name, email, phone, or username..."
                }
                className="rounded-3"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Col>
            {activeTab === 'booked' && (
              <Col md={4}>
                <Form.Select
                  id="select-bus-filter"
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
            )}
          </Row>

          {/* ─── BOOKED PASSENGERS TABLE ─── */}
          {activeTab === 'booked' && (
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
                  {filteredBooked.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">
                        No booked passengers found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBooked.map((p, idx) => (
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
          )}

          {/* ─── REGISTERED PASSENGERS TABLE ─── */}
          {activeTab === 'registered' && (
            <div className="table-responsive">
              {loadingRegistered ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-2">Loading registered passengers...</p>
                </div>
              ) : (
                <Table hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Passenger</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registered</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          {registeredPassengers.length === 0
                            ? 'No registered passengers yet. Use the "Register Passenger" button to add one.'
                            : 'No passengers match your search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredRegistered.map(p => (
                        <tr key={p.passenger_id}>
                          <td className="fw-medium">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                style={{
                                  width: 38,
                                  height: 38,
                                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                  color: '#fff',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {(p.name || 'P').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div>{p.name}</div>
                                <small className="text-muted">ID #{p.passenger_id}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <code className="text-info">{p.username || '—'}</code>
                          </td>
                          <td>
                            <span className="small">✉️ {p.email}</span>
                          </td>
                          <td>
                            <span className="small">📞 {p.phone || 'N/A'}</span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {p.registered_at
                                ? new Date(p.registered_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                : '—'}
                            </small>
                          </td>
                          <td>{statusBadge(p.status)}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              className="rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
                              onClick={() => openResetModal(p)}
                              title={`Reset password for ${p.name || p.username}`}
                              id={`btn-passenger-reset-${p.passenger_id}`}
                            >
                              <span>🔑</span> Reset Password
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          REGISTER PASSENGER MODAL (Admin Only)
         ═══════════════════════════════════════════════════════ */}
      <Modal
        show={showRegisterModal}
        onHide={closeModal}
        centered
        size="lg"
        contentClassName="border-0"
      >
        <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
          {/* Modal Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              padding: '28px 32px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute', top: '-30%', right: '-10%',
                width: 200, height: 200,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '50%',
              }}
            />
            <h4 className="fw-bold text-white mb-1" style={{ position: 'relative', zIndex: 1 }}>
              ➕ Register New Passenger
            </h4>
            <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.75)', position: 'relative', zIndex: 1 }}>
              Create a user account and passenger profile. The passenger can log in with these credentials.
            </p>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '28px 32px' }}>
            {regError && (
              <Alert variant="danger" className="d-flex align-items-center gap-2 rounded-3 py-2 mb-3" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                <span>⚠️</span> {regError}
              </Alert>
            )}
            {regSuccess && (
              <Alert variant="success" className="d-flex align-items-center gap-2 rounded-3 py-2 mb-3" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                <span>✅</span> {regSuccess}
              </Alert>
            )}

            <form onSubmit={handleAdminRegister}>
              <Row className="g-3">
                {/* Full Name */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold" style={{ color: '#94a3b8' }}>
                      Full Name <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <span className="position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', opacity: 0.5 }}>👤</span>
                      <Form.Control
                        id="reg-name"
                        name="name"
                        type="text"
                        placeholder="e.g. Abebe Kebede"
                        value={regForm.name}
                        onChange={handleRegFormChange}
                        disabled={regLoading}
                        style={{ ...glassInput, paddingLeft: 44 }}
                      />
                    </div>
                  </Form.Group>
                </Col>

                {/* Email */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold" style={{ color: '#94a3b8' }}>
                      Email Address <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <span className="position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', opacity: 0.5 }}>📧</span>
                      <Form.Control
                        id="reg-email"
                        name="email"
                        type="email"
                        placeholder="passenger@example.com"
                        value={regForm.email}
                        onChange={handleRegFormChange}
                        disabled={regLoading}
                        style={{ ...glassInput, paddingLeft: 44 }}
                      />
                    </div>
                  </Form.Group>
                </Col>

                {/* Phone */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold" style={{ color: '#94a3b8' }}>
                      Phone Number <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <span className="position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', opacity: 0.5 }}>📞</span>
                      <Form.Control
                        id="reg-phone"
                        name="phone"
                        type="tel"
                        placeholder="+251 911 123 456"
                        value={regForm.phone}
                        onChange={handleRegFormChange}
                        disabled={regLoading}
                        style={{ ...glassInput, paddingLeft: 44 }}
                      />
                    </div>
                  </Form.Group>
                </Col>

                {/* Username (Optional) */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold" style={{ color: '#94a3b8' }}>
                      Username <span className="text-muted">(optional — auto-generated if empty)</span>
                    </Form.Label>
                    <div className="position-relative">
                      <span className="position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', opacity: 0.5 }}>🆔</span>
                      <Form.Control
                        id="reg-username"
                        name="username"
                        type="text"
                        placeholder="Auto-generated from name"
                        value={regForm.username}
                        onChange={handleRegFormChange}
                        disabled={regLoading}
                        style={{ ...glassInput, paddingLeft: 44 }}
                      />
                    </div>
                  </Form.Group>
                </Col>

                {/* Password (Optional) */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold" style={{ color: '#94a3b8' }}>
                      Password <span className="text-muted">(optional — defaults to Pass1234)</span>
                    </Form.Label>
                    <div className="position-relative">
                      <span className="position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', opacity: 0.5 }}>🔒</span>
                      <Form.Control
                        id="reg-password"
                        name="password"
                        type="password"
                        placeholder="Default: Pass1234"
                        value={regForm.password}
                        onChange={handleRegFormChange}
                        disabled={regLoading}
                        style={{ ...glassInput, paddingLeft: 44 }}
                      />
                    </div>
                  </Form.Group>
                </Col>

                {/* Info box */}
                <Col xs={12}>
                  <div
                    className="d-flex align-items-start gap-2 rounded-3 p-3 mt-1"
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                    <div className="small" style={{ color: '#93c5fd' }}>
                      This creates a <strong>user account</strong> (role: Passenger) and a <strong>passenger profile</strong>.
                      The passenger can log in with the username and password shown after registration.
                      Please share the credentials with the passenger securely.
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Actions */}
              <div className="d-flex justify-content-end gap-2 mt-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-4"
                  onClick={closeModal}
                  disabled={regLoading}
                  style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#94a3b8' }}
                >
                  Cancel
                </Button>
                <Button
                  id="btn-submit-register"
                  type="submit"
                  className="rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
                  disabled={regLoading}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                  }}
                >
                  {regLoading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Registering...
                    </>
                  ) : (
                    <>➕ Register Passenger</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════
          ADMIN RESET PASSENGER PASSWORD MODAL
         ═══════════════════════════════════════════════════════ */}
      <Modal
        show={resetModal.show}
        onHide={closeResetModal}
        centered
        contentClassName="border-0"
      >
        <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
          {/* Modal Header */}
          <div
            className="p-4 d-flex justify-content-between align-items-center"
            style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.08))',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <h5 className="fw-bold mb-0 text-white">🔑 Reset Passenger Password</h5>
              <small className="text-warning">
                Reset forgotten credentials for {resetModal.passenger?.name || resetModal.passenger?.username}
              </small>
            </div>
            <button
              onClick={closeResetModal}
              className="btn btn-sm text-white-50"
              style={{ background: 'none', border: 'none', fontSize: '1.2rem', lineHeight: 1 }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {resetModal.error && (
              <Alert variant="danger" className="rounded-3 py-2 small mb-3">
                {resetModal.error}
              </Alert>
            )}

            {resetModal.result ? (
              <div className="text-center py-2">
                <div className="fs-1 mb-2">🎉</div>
                <h5 className="fw-bold text-success mb-2">Password Successfully Reset!</h5>
                <p className="text-white-50 small mb-3">
                  The passenger account password has been updated. Provide these new credentials to the passenger.
                </p>

                <div
                  className="p-3 rounded-3 text-start mb-3"
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="small text-muted mb-1">Passenger Name / Username:</div>
                  <div className="fw-bold text-info mb-2 fs-6">
                    {resetModal.passenger?.name} ({resetModal.result.username})
                  </div>
                  <div className="small text-muted mb-1">Email Address:</div>
                  <div className="text-white mb-2 fs-6">{resetModal.result.email}</div>
                  <div className="small text-muted mb-1">New Temporary Password:</div>
                  <div className="fw-bold text-warning fs-5 font-monospace">{resetModal.result.new_password}</div>
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    variant={resetModal.copied ? "success" : "primary"}
                    className="rounded-pill px-4 fw-semibold"
                    onClick={() => copyCredentials(resetModal.result.username, resetModal.result.new_password)}
                  >
                    {resetModal.copied ? "✅ Copied to Clipboard!" : "📋 Copy Credentials"}
                  </Button>
                  <Button
                    variant="outline-light"
                    className="rounded-pill px-4"
                    onClick={closeResetModal}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="p-3 mb-3 rounded-3"
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="small text-white-50">Passenger Account:</div>
                  <div className="fw-bold fs-6 text-white">{resetModal.passenger?.name}</div>
                  <div className="small text-info">
                    Username: <code>{resetModal.passenger?.username || '—'}</code> • Email: {resetModal.passenger?.email}
                  </div>
                </div>

                <Form onSubmit={handleResetPassword}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted fw-semibold">Reset Option</Form.Label>
                    <div className="d-flex flex-column gap-2 mt-1">
                      <Form.Check
                        type="radio"
                        id="passenger-opt-auto"
                        name="passengerResetMode"
                        label="Auto-generate secure temporary password (e.g. TransLink#8392)"
                        checked={resetModal.mode === 'auto'}
                        onChange={() => setResetModal(prev => ({ ...prev, mode: 'auto', error: '' }))}
                        className="small text-white"
                      />
                      <Form.Check
                        type="radio"
                        id="passenger-opt-custom"
                        name="passengerResetMode"
                        label="Specify custom new password"
                        checked={resetModal.mode === 'custom'}
                        onChange={() => setResetModal(prev => ({ ...prev, mode: 'custom', error: '' }))}
                        className="small text-white"
                      />
                    </div>
                  </Form.Group>

                  {resetModal.mode === 'custom' && (
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">New Password (min. 6 characters)</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={resetModal.showPassword ? "text" : "password"}
                          placeholder="Enter new password for passenger"
                          style={glassInput}
                          value={resetModal.customPassword}
                          onChange={e => setResetModal(prev => ({ ...prev, customPassword: e.target.value, error: '' }))}
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          className="text-white-50"
                          type="button"
                          onClick={() => setResetModal(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          {resetModal.showPassword ? "🙈" : "👁️"}
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  )}

                  <p className="text-white-50 small mb-4">
                    {resetModal.mode === 'auto'
                      ? "A randomized password will be generated upon confirmation. You will be able to copy and give it to the passenger."
                      : "The passenger's password will immediately be updated to what you typed above."}
                  </p>

                  <div className="d-flex justify-content-end gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Button variant="outline-secondary" className="rounded-pill px-4" onClick={closeResetModal}>
                      Cancel
                    </Button>
                    <Button
                      variant="warning"
                      type="submit"
                      className="rounded-pill px-4 fw-bold"
                      disabled={resetModal.loading}
                      id="btn-confirm-passenger-reset"
                    >
                      {resetModal.loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Resetting...
                        </>
                      ) : (
                        "Confirm & Reset Password"
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </Container>
  );
};

export default PassengersPage;
