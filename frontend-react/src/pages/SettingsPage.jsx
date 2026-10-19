import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Nav, Form, Button, Alert, Table, Badge, Modal, Spinner, InputGroup } from 'react-bootstrap';
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

  // User Accounts & Password Reset State (Admin Only)
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [resetModal, setResetModal] = useState({
    show: false,
    user: null,
    mode: 'auto', // 'auto' or 'custom'
    customPassword: '',
    showPassword: false,
    loading: false,
    result: null,
    copied: false,
    error: ''
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

  // Load users when users tab is opened
  const fetchUsers = useCallback(async () => {
    if (!authFetch || !isAdmin) return;
    setUsersLoading(true);
    try {
      const res = await authFetch('/auth/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsersList(data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [authFetch, isAdmin]);

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin, fetchUsers]);

  const openResetModal = (u) => {
    setResetModal({
      show: true,
      user: u,
      mode: 'auto',
      customPassword: '',
      showPassword: false,
      loading: false,
      result: null,
      copied: false,
      error: ''
    });
  };

  const closeResetModal = () => {
    setResetModal({
      show: false,
      user: null,
      mode: 'auto',
      customPassword: '',
      showPassword: false,
      loading: false,
      result: null,
      copied: false,
      error: ''
    });
  };

  const handleAdminPasswordReset = async (e) => {
    if (e) e.preventDefault();
    if (!resetModal.user) return;

    if (resetModal.mode === 'custom') {
      if (!resetModal.customPassword || resetModal.customPassword.trim().length < 6) {
        setResetModal(prev => ({ ...prev, error: 'Custom password must be at least 6 characters long.' }));
        return;
      }
    }

    setResetModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const payload = {
        user_id: resetModal.user.user_id,
        ...(resetModal.mode === 'custom' ? { new_password: resetModal.customPassword.trim() } : {})
      };

      const res = await authFetch('/auth/admin/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Password reset failed');
      }

      setResetModal(prev => ({
        ...prev,
        loading: false,
        result: data.data,
        error: ''
      }));

      showAlert('success', `Password for ${resetModal.user.username} was successfully reset!`);
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

  const filteredUsers = usersList.filter(u => {
    const s = userSearch.toLowerCase();
    const matchesSearch =
      (u.username || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s) ||
      (u.full_name || '').toLowerCase().includes(s) ||
      (u.phone || '').toLowerCase().includes(s);
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

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
                      active={activeTab === 'users'}
                      onClick={() => setActiveTab('users')}
                      className="rounded-3 text-white d-flex align-items-center gap-2 cursor-pointer"
                    >
                      🔑 User Accounts & Reset
                    </Nav.Link>
                  </Nav.Item>
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

          {/* 6. Admin User Accounts & Password Reset */}
          {activeTab === 'users' && isAdmin && (
            <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h5 className="fw-bold mb-1">🔑 User Accounts & Password Reset</h5>
                  <p className="text-white-50 small mb-0">
                    Search and reset lost or forgotten passwords for passengers, drivers, and administrators.
                  </p>
                </div>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="rounded-pill px-3"
                  onClick={fetchUsers}
                  disabled={usersLoading}
                >
                  🔄 {usersLoading ? 'Refreshing...' : 'Refresh List'}
                </Button>
              </div>

              {/* Stats KPI pills */}
              <Row className="g-3 mb-4">
                <Col sm={3} xs={6}>
                  <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25">
                    <div className="text-white-50 small">Total Accounts</div>
                    <div className="h4 fw-bold text-white mb-0">{usersList.length}</div>
                  </div>
                </Col>
                <Col sm={3} xs={6}>
                  <div className="p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25">
                    <div className="text-white-50 small">Passengers</div>
                    <div className="h4 fw-bold text-success mb-0">
                      {usersList.filter(u => u.role === 'Passenger').length}
                    </div>
                  </div>
                </Col>
                <Col sm={3} xs={6}>
                  <div className="p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
                    <div className="text-white-50 small">Drivers</div>
                    <div className="h4 fw-bold text-info mb-0">
                      {usersList.filter(u => u.role === 'Driver').length}
                    </div>
                  </div>
                </Col>
                <Col sm={3} xs={6}>
                  <div className="p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25">
                    <div className="text-white-50 small">Admins</div>
                    <div className="h4 fw-bold text-danger mb-0">
                      {usersList.filter(u => u.role === 'Admin').length}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Filters */}
              <Row className="g-2 mb-3">
                <Col md={7}>
                  <Form.Control
                    type="text"
                    placeholder="Search by username, full name, phone, or email..."
                    className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </Col>
                <Col md={5}>
                  <Form.Select
                    className="bg-secondary bg-opacity-25 text-white border-secondary rounded-3"
                    value={userRoleFilter}
                    onChange={e => setUserRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="Passenger">Passengers Only</option>
                    <option value="Driver">Drivers Only</option>
                    <option value="Admin">Administrators Only</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* Users Table */}
              <div className="table-responsive">
                {usersLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="info" />
                    <p className="text-white-50 mt-2 small">Loading system accounts...</p>
                  </div>
                ) : (
                  <Table hover className="align-middle mb-0 text-white">
                    <thead className="table-light">
                      <tr>
                        <th>User</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-white-50">
                            No accounts match your search filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u.user_id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                  style={{
                                    width: 34,
                                    height: 34,
                                    background:
                                      u.role === 'Admin'
                                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                        : u.role === 'Driver'
                                        ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                                        : 'linear-gradient(135deg, #10b981, #059669)',
                                    color: '#fff',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  {(u.full_name || u.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-semibold">{u.full_name || u.username}</div>
                                  <small className="text-white-50">ID #{u.user_id}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <code className="text-info">{u.username}</code>
                            </td>
                            <td className="small">{u.email}</td>
                            <td className="small text-white-50">{u.phone || 'N/A'}</td>
                            <td>
                              <Badge
                                bg={u.role === 'Admin' ? 'danger' : u.role === 'Driver' ? 'primary' : 'success'}
                                className="rounded-pill px-3 py-1"
                              >
                                {u.role}
                              </Badge>
                            </td>
                            <td>
                              <Badge
                                bg={u.status === 'Active' ? 'success' : 'secondary'}
                                className="rounded-pill px-2 py-1"
                              >
                                {u.status || 'Active'}
                              </Badge>
                            </td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-warning"
                                className="rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
                                onClick={() => openResetModal(u)}
                                id={`btn-reset-user-${u.user_id}`}
                              >
                                <span>🔑</span> Reset
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                )}
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* ═══════════════════════════════════════════════════════
          ADMIN PASSWORD RESET MODAL
         ═══════════════════════════════════════════════════════ */}
      <Modal
        show={resetModal.show}
        onHide={closeResetModal}
        centered
        contentClassName="bg-dark text-white border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
          <Modal.Title className="fw-bold fs-5">
            🔑 Reset Password for {resetModal.user?.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
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
                The account password has been updated. Provide these new credentials to the user.
              </p>
              
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-50 text-start mb-3">
                <div className="small text-muted mb-1">Account Username:</div>
                <div className="fw-bold text-info mb-2 fs-6">{resetModal.result.username}</div>
                <div className="small text-muted mb-1">User Email:</div>
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
              <div className="p-3 mb-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25">
                <div className="small text-white-50">Target User Account:</div>
                <div className="fw-bold fs-6 text-white">{resetModal.user?.full_name || resetModal.user?.username}</div>
                <div className="small text-info">{resetModal.user?.email} • Role: {resetModal.user?.role}</div>
              </div>

              <Form onSubmit={handleAdminPasswordReset}>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted fw-semibold">Reset Option</Form.Label>
                  <div className="d-flex flex-column gap-2 mt-1">
                    <Form.Check
                      type="radio"
                      id="opt-auto"
                      name="resetMode"
                      label="Auto-generate secure temporary password (e.g. TransLink#5829)"
                      checked={resetModal.mode === 'auto'}
                      onChange={() => setResetModal(prev => ({ ...prev, mode: 'auto', error: '' }))}
                      className="small"
                    />
                    <Form.Check
                      type="radio"
                      id="opt-custom"
                      name="resetMode"
                      label="Specify custom new password"
                      checked={resetModal.mode === 'custom'}
                      onChange={() => setResetModal(prev => ({ ...prev, mode: 'custom', error: '' }))}
                      className="small"
                    />
                  </div>
                </Form.Group>

                {resetModal.mode === 'custom' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted">New Password (min. 6 characters)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={resetModal.showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="bg-secondary bg-opacity-25 text-white border-secondary rounded-start-3"
                        value={resetModal.customPassword}
                        onChange={e => setResetModal(prev => ({ ...prev, customPassword: e.target.value, error: '' }))}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        className="rounded-end-3 text-white-50"
                        type="button"
                        onClick={() => setResetModal(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      >
                        {resetModal.showPassword ? "🙈" : "👁️"}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                )}

                <p className="text-white-50 small mb-4">
                  {resetModal.mode === 'auto'
                    ? "A secure randomized password will be generated upon confirmation. You can copy and hand it to the user."
                    : "The password will be immediately updated to what you typed above."}
                </p>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" className="rounded-pill px-4" onClick={closeResetModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="warning"
                    type="submit"
                    className="rounded-pill px-4 fw-bold"
                    disabled={resetModal.loading}
                    id="btn-confirm-reset-password"
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
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SettingsPage;
