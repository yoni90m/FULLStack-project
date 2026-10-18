import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage = () => {
  const { user, isAdmin, isDriver, authFetch } = useAuth();
  const isPassenger = user?.role === 'Passenger';

  const [activeTab, setActiveTab] = useState('profile');
  const [alert, setAlert] = useState({ show: false, variant: 'success', message: '' });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: '+251 911 234 567',
    name: user?.username || ''
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Admin System Settings State
  const [adminSettings, setAdminSettings] = useState({
    system_name: 'TransLink Intercity Bus Express',
    support_phone: '+251 911 000 111',
    support_email: 'support@translink.com',
    currency: 'ETB',
    cancellation_policy_hours: '2',
    max_seats_per_booking: '4'
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, username: 'admin', action: 'CREATE_SCHEDULE', details: 'Scheduled trip Addis Ababa → Bahir Dar (BUS-101)', timestamp: '2026-10-10 08:30:15' },
    { id: 2, username: 'admin', action: 'UPDATE_BUS_STATUS', details: 'Set BUS-105 status to Maintenance', timestamp: '2026-10-10 09:12:00' },
    { id: 3, username: 'driver_john', action: 'TRIP_STATUS_UPDATE', details: "Updated TRIP #1 status to 'In Transit'", timestamp: '2026-10-10 10:00:22' },
    { id: 4, username: 'admin', action: 'UPDATE_FARE', details: 'Updated Addis Ababa → Hawassa fare to ETB 320.00', timestamp: '2026-10-10 11:45:00' },
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState({
    tripAlerts: true,
    emailReceipts: true,
    smsBoarding: true,
    maintenanceAlerts: true
  });

  const [themeMode, setThemeMode] = useState('dark');

  // Load backend settings
  useEffect(() => {
    if (authFetch && isAdmin) {
      authFetch('/reports/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setAdminSettings(prev => ({ ...prev, ...data.data }));
          }
        })
        .catch(() => {});

      authFetch('/reports/audit-logs')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setAuditLogs(data.data);
          }
        })
        .catch(() => {});
    }
  }, [authFetch, isAdmin]);

  const showAlert = (variant, message) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: 'success', message: '' }), 4000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authFetch) {
        const res = await authFetch('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ email: profileForm.email, username: profileForm.username })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Profile update failed');
        }
      }
      showAlert('success', 'Profile information updated successfully.');
    } catch (err) {
      showAlert('danger', err.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('danger', 'New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showAlert('danger', 'New password must be at least 6 characters.');
      return;
    }

    try {
      if (authFetch) {
        const res = await authFetch('/auth/change-password', {
          method: 'PUT',
          body: JSON.stringify({
            old_password: passwordForm.oldPassword,
            new_password: passwordForm.newPassword
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Password update failed');
        }
      }
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showAlert('success', 'Your password has been changed securely.');
    } catch (err) {
      showAlert('danger', err.message || 'Password change failed. Check your current password.');
    }
  };

  const handleAdminSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authFetch) {
        await authFetch('/reports/settings', {
          method: 'POST',
          body: JSON.stringify(adminSettings)
        });
      }
      showAlert('success', 'System configurations and policies updated.');
    } catch (err) {
      showAlert('danger', 'Failed to save system settings.');
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold mb-1">⚙️ Account & System Settings</h4>
          <p className="text-muted small mb-0">
            Configure profile settings, security credentials, and role-specific configurations.
          </p>
        </Col>
      </Row>

      {alert.show && (
        <Alert variant={alert.variant} className="rounded-3 shadow-sm mb-4">
          {alert.message}
        </Alert>
      )}

      <Row className="g-4">
        {/* Navigation Sidebar */}
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-2">
            <Nav variant="pills" className="flex-column gap-1">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  className="rounded-3 text-white d-flex align-items-center gap-2 cursor-pointer"
                >
                  👤 Personal Profile
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'security'}
                  onClick={() => setActiveTab('security')}
                  className="rounded-3 text-white d-flex align-items-center gap-2 cursor-pointer"
                >
                  🔒 Password & Security
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'notifications'}
                  onClick={() => setActiveTab('notifications')}
                  className="rounded-3 text-white d-flex align-items-center gap-2 cursor-pointer"
                >
                  🔔 Notifications & Theme
                </Nav.Link>
              </Nav.Item>
              {isAdmin && (
                <>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === 'system'}
                      onClick={() => setActiveTab('system')}
                      className="rounded-3 text-white d-flex align-items-center gap-2 cursor-pointer"
                    >
                      🏢 Transit System Policies
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === 'audit'}
                      onClick={() => setActiveTab('audit')}
                      className="rounded-3 text-white d-flex align-items-center gap-2 cursor-pointer"
                    >
                      📜 System Audit Logs
                    </Nav.Link>
                  </Nav.Item>
                </>
              )}
            </Nav>
          </Card>
        </Col>

        {/* Content Column */}
        <Col md={9}>
          {/* 1. Profile Settings */}
          {activeTab === 'profile' && (
            <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-4">
              <h5 className="fw-bold mb-3">👤 Profile Information</h5>
              <Form onSubmit={handleProfileSubmit}>
                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted">Username</Form.Label>
                      <Form.Control
                        type="text"
                        className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                        value={profileForm.username}
                        onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted">Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted">Contact Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted">Account Role</Form.Label>
                      <Form.Control
                        type="text"
                        disabled
                        className="bg-dark text-info border-secondary rounded-3"
                        value={`${user?.role || 'Passenger'} (Authorized)`}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {isDriver && (
                  <div className="p-3 mb-4 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
                    <div className="fw-semibold text-info small mb-1">👨‍✈️ Commercial Driver Credentials</div>
                    <div className="small text-white-50">
                      Driver License Number: <strong>DL-AA-9023812</strong> | Status: <Badge bg="success">Active</Badge>
                    </div>
                  </div>
                )}

                <Button variant="primary" type="submit" className="rounded-pill px-4">
                  Save Profile Changes
                </Button>
              </Form>
            </Card>
          )}

          {/* 2. Security & Password */}
          {activeTab === 'security' && (
            <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-4">
              <h5 className="fw-bold mb-3">🔒 Change Account Password</h5>
              <p className="text-white-50 small mb-4">
                Ensure your account uses a secure password with at least 6 characters. Passwords are encrypted with SHA-256 and scrypt.
              </p>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3" style={{ maxWidth: '480px' }}>
                  <Form.Label className="small text-muted">Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter current password"
                    className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" style={{ maxWidth: '480px' }}>
                  <Form.Label className="small text-muted">New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password (min. 6 chars)"
                    className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4" style={{ maxWidth: '480px' }}>
                  <Form.Label className="small text-muted">Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Re-enter new password"
                    className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </Form.Group>
                <Button variant="danger" type="submit" className="rounded-pill px-4">
                  Update Password
                </Button>
              </Form>
            </Card>
          )}

          {/* 3. Notifications & Theme */}
          {activeTab === 'notifications' && (
            <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-4">
              <h5 className="fw-bold mb-3">🔔 Notification Preferences & Display</h5>
              <div className="mb-4">
                <Form.Check
                  type="switch"
                  id="switch-trip-alerts"
                  label="Trip Departure & Boarding Reminders"
                  checked={notifications.tripAlerts}
                  onChange={e => setNotifications({ ...notifications, tripAlerts: e.target.checked })}
                  className="mb-2"
                />
                <Form.Check
                  type="switch"
                  id="switch-email-receipts"
                  label="Email Electronic Ticket Receipts"
                  checked={notifications.emailReceipts}
                  onChange={e => setNotifications({ ...notifications, emailReceipts: e.target.checked })}
                  className="mb-2"
                />
                <Form.Check
                  type="switch"
                  id="switch-maint-alerts"
                  label="Service Delays & Cancellation Notifications"
                  checked={notifications.maintenanceAlerts}
                  onChange={e => setNotifications({ ...notifications, maintenanceAlerts: e.target.checked })}
                  className="mb-2"
                />
              </div>

              <h6 className="fw-bold mb-3 pt-3 border-top border-secondary border-opacity-25">
                🎨 Interface Display Theme
              </h6>
              <div className="d-flex gap-3 mb-4">
                <Button
                  variant={themeMode === 'dark' ? 'primary' : 'outline-secondary'}
                  className="rounded-pill px-4"
                  onClick={() => setThemeMode('dark')}
                >
                  🌙 Deep Transit Dark
                </Button>
                <Button
                  variant={themeMode === 'light' ? 'primary' : 'outline-secondary'}
                  className="rounded-pill px-4"
                  onClick={() => setThemeMode('light')}
                >
                  ☀️ Daylight High Contrast
                </Button>
              </div>

              <Button
                variant="primary"
                className="rounded-pill px-4"
                onClick={() => showAlert('success', 'Preferences saved successfully.')}
              >
                Save Preferences
              </Button>
            </Card>
          )}

          {/* 4. Admin Transit Policies */}
          {activeTab === 'system' && isAdmin && (
            <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-4">
              <h5 className="fw-bold mb-3">🏢 Transit System Configuration & Policies</h5>
              <Form onSubmit={handleAdminSettingsSubmit}>
                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted">Company / System Name</Form.Label>
                      <Form.Control
                        type="text"
                        className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                        value={adminSettings.system_name}
                        onChange={e => setAdminSettings({ ...adminSettings, system_name: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted">System Currency Code</Form.Label>
                      <Form.Control
                        type="text"
                        className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                        value={adminSettings.currency}
                        onChange={e => setAdminSettings({ ...adminSettings, currency: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted">Free Cancellation Window (Hours Before Departure)</Form.Label>
                      <Form.Control
                        type="number"
                        className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                        value={adminSettings.cancellation_policy_hours}
                        onChange={e => setAdminSettings({ ...adminSettings, cancellation_policy_hours: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small text-muted">Max Reserved Chairs per Passenger</Form.Label>
                      <Form.Control
                        type="number"
                        className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                        value={adminSettings.max_seats_per_booking}
                        onChange={e => setAdminSettings({ ...adminSettings, max_seats_per_booking: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="success" type="submit" className="rounded-pill px-4">
                  Save System Policies
                </Button>
              </Form>
            </Card>
          )}

          {/* 5. Admin Audit Logs */}
          {activeTab === 'audit' && isAdmin && (
            <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-4">
              <h5 className="fw-bold mb-3">📜 Administrative Action Audit Logs</h5>
              <p className="text-white-50 small mb-3">
                Chronological record of sensitive operations, schedule creations, status modifications, and policy changes.
              </p>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 text-white">
                  <thead className="table-light">
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td className="small text-muted">{log.timestamp}</td>
                        <td><Badge bg="primary">{log.username}</Badge></td>
                        <td className="fw-semibold text-info">{log.action}</td>
                        <td className="small text-white-50">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsPage;
