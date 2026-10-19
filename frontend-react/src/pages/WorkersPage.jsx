import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const WorkersPage = () => {
  const { user, isSuperAdmin, authFetch } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [alert, setAlert] = useState({ show: false, variant: 'success', message: '' });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editWorker, setEditWorker] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'Admin',
    status: 'Active'
  });
  const [showPassword, setShowPassword] = useState(false);

  // Delete confirm modal
  const [deleteModal, setDeleteModal] = useState({ show: false, worker: null });

  const showAlert = (variant, message) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
  };

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      const res = await authFetch(`/workers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setWorkers(data.data || []);
      } else {
        showAlert('danger', data.message || 'Failed to load workers.');
      }
    } catch (err) {
      showAlert('danger', err.message || 'Failed to load workers.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, search, roleFilter]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const openAdd = () => {
    setEditWorker(null);
    setForm({ username: '', email: '', password: '', name: '', role: 'Admin', status: 'Active' });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (w) => {
    setEditWorker(w);
    setForm({
      username: w.username || '',
      email: w.email || '',
      password: '',
      name: w.full_name || w.username || '',
      role: w.role || 'Admin',
      status: w.status || 'Active'
    });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      if (editWorker) {
        // Update existing
        const res = await authFetch(`/workers/${editWorker.user_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password || undefined,
            role: form.role,
            status: form.status
          })
        });
        const data = await res.json();
        if (data.success) {
          showAlert('success', data.message || 'Worker updated successfully.');
          setShowModal(false);
          fetchWorkers();
        } else {
          showAlert('danger', data.message || 'Failed to update worker.');
        }
      } else {
        // Create new
        const res = await authFetch('/workers', {
          method: 'POST',
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
            name: form.name,
            role: form.role
          })
        });
        const data = await res.json();
        if (data.success) {
          showAlert('success', data.message || 'Worker created successfully.');
          setShowModal(false);
          fetchWorkers();
        } else {
          showAlert('danger', data.message || 'Failed to create worker.');
        }
      }
    } catch (err) {
      showAlert('danger', err.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async () => {
    const w = deleteModal.worker;
    if (!w) return;
    try {
      const res = await authFetch(`/workers/${w.user_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showAlert('warning', data.message || 'Worker deactivated.');
        fetchWorkers();
      } else {
        showAlert('danger', data.message || 'Failed to deactivate worker.');
      }
    } catch (err) {
      showAlert('danger', err.message || 'Operation failed.');
    } finally {
      setDeleteModal({ show: false, worker: null });
    }
  };

  const handleActivate = async (w) => {
    try {
      const res = await authFetch(`/workers/${w.user_id}/activate`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        showAlert('success', data.message || 'Worker re-activated.');
        fetchWorkers();
      } else {
        showAlert('danger', data.message || 'Failed to activate worker.');
      }
    } catch (err) {
      showAlert('danger', err.message || 'Operation failed.');
    }
  };

  const roleBadgeVariant = (role) => {
    if (role === 'Super Admin') return 'danger';
    if (role === 'Admin') return 'primary';
    return 'secondary';
  };

  const statusBadgeVariant = (status) => {
    if (status === 'Active') return 'success';
    return 'secondary';
  };

  const filteredWorkers = workers;

  const totalSuperAdmins = workers.filter(w => w.role === 'Super Admin').length;
  const totalAdmins = workers.filter(w => w.role === 'Admin').length;
  const totalActive = workers.filter(w => w.status === 'Active').length;

  return (
    <Container fluid className="p-4">
      {/* Page Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="fw-bold mb-1">🛡️ Worker Management</h4>
          <p className="text-muted mb-0 small">
            Manage system administrators and super administrators
          </p>
        </Col>
        {isSuperAdmin && (
          <Col xs="auto">
            <Button
              variant="primary"
              className="rounded-pill px-4 shadow-sm"
              onClick={openAdd}
            >
              <span className="me-1">+</span> Add Worker
            </Button>
          </Col>
        )}
      </Row>

      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false })}>
          {alert.message}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center p-3" style={{ background: 'linear-gradient(135deg, #dc354520, #dc354508)' }}>
            <div style={{ fontSize: '2rem' }}>👑</div>
            <div className="fw-bold fs-4 text-danger">{totalSuperAdmins}</div>
            <div className="text-muted small">Super Admins</div>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center p-3" style={{ background: 'linear-gradient(135deg, #0d6efd20, #0d6efd08)' }}>
            <div style={{ fontSize: '2rem' }}>🔑</div>
            <div className="fw-bold fs-4 text-primary">{totalAdmins}</div>
            <div className="text-muted small">Admins</div>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center p-3" style={{ background: 'linear-gradient(135deg, #19875420, #19875408)' }}>
            <div style={{ fontSize: '2rem' }}>✅</div>
            <div className="fw-bold fs-4 text-success">{totalActive}</div>
            <div className="text-muted small">Active Workers</div>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center p-3" style={{ background: 'linear-gradient(135deg, #6c757d20, #6c757d08)' }}>
            <div style={{ fontSize: '2rem' }}>👥</div>
            <div className="fw-bold fs-4">{workers.length}</div>
            <div className="text-muted small">Total Workers</div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-2 align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search workers by name, username, or email..."
                  className="border-start-0"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Badge bg="light" text="dark" className="px-3 py-2 fs-6">
                {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Workers Table */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2">Loading workers...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', opacity: 0.3 }}>🛡️</div>
              <p className="text-muted mt-2">No workers found</p>
              {isSuperAdmin && (
                <Button variant="outline-primary" className="rounded-pill" onClick={openAdd}>
                  + Add First Worker
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th className="ps-4">Worker</th>
                    <th className="d-none d-md-table-cell">Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="d-none d-sm-table-cell">Created</th>
                    {isSuperAdmin && <th className="text-end pe-4">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map(w => (
                    <tr key={w.user_id} style={{ transition: 'background 0.2s' }}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className={`rounded-circle d-flex justify-content-center align-items-center text-white fw-bold`}
                            style={{
                              width: 38,
                              height: 38,
                              fontSize: '0.85rem',
                              background: w.role === 'Super Admin'
                                ? 'linear-gradient(135deg, #dc3545, #fd7e14)'
                                : 'linear-gradient(135deg, #0d6efd, #6f42c1)'
                            }}
                          >
                            {(w.full_name || w.username || 'W').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold">{w.full_name || w.username}</div>
                            <div className="text-muted small">@{w.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell text-muted">{w.email}</td>
                      <td>
                        <Badge
                          bg={roleBadgeVariant(w.role)}
                          className="rounded-pill px-3 py-1"
                        >
                          {w.role === 'Super Admin' ? '👑 ' : '🔑 '}
                          {w.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          bg={statusBadgeVariant(w.status)}
                          className={`rounded-pill px-2 py-1 ${w.status === 'Active' ? '' : 'bg-opacity-50'}`}
                        >
                          {w.status === 'Active' ? '● ' : '○ '}
                          {w.status}
                        </Badge>
                      </td>
                      <td className="d-none d-sm-table-cell text-muted small">
                        {w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}
                      </td>
                      {isSuperAdmin && (
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-pill px-3"
                              onClick={() => openEdit(w)}
                              title="Edit Worker"
                            >
                              ✏️ Edit
                            </Button>
                            {w.user_id !== user?.user_id && (
                              w.status === 'Active' ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="rounded-pill px-3"
                                  onClick={() => setDeleteModal({ show: true, worker: w })}
                                  title="Deactivate Worker"
                                >
                                  ⛔ Deactivate
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="rounded-pill px-3"
                                  onClick={() => handleActivate(w)}
                                  title="Re-activate Worker"
                                >
                                  ✅ Activate
                                </Button>
                              )
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Info banner for non-Super Admin */}
      {!isSuperAdmin && (
        <Card className="border-0 shadow-sm rounded-4 mt-4" style={{ background: 'linear-gradient(135deg, #ffc10720, #fd7e1410)' }}>
          <Card.Body className="d-flex align-items-center gap-3 py-3">
            <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
            <div>
              <div className="fw-semibold">View-Only Access</div>
              <div className="text-muted small">
                Only Super Admins can add, edit, or deactivate worker accounts. Contact your Super Admin for changes.
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', borderBottom: 'none' }}>
          <Modal.Title className="fw-bold">
            {editWorker ? (
              <>✏️ Edit Worker — <span className="text-info">@{editWorker.username}</span></>
            ) : (
              <>👤 Create New Worker</>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-3">
            {!editWorker && (
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Abebe Kebede"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </Form.Group>
              </Col>
            )}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Username *</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-transparent">@</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="e.g. admin_user"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Email *</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="e.g. worker@translink.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  {editWorker ? 'New Password (leave empty to keep)' : 'Password *'}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editWorker ? 'Leave empty to keep current' : 'Min 6 characters'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required={!editWorker}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Role *</Form.Label>
                <Form.Select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Admin">🔑 Admin</option>
                  <option value="Super Admin">👑 Super Admin</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  {form.role === 'Super Admin'
                    ? 'Full system access — can manage all workers, settings, and data.'
                    : 'Standard admin access — can manage buses, routes, schedules, drivers, passengers, bookings, and reports.'}
                </Form.Text>
              </Form.Group>
            </Col>
            {editWorker && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">✅ Active</option>
                    <option value="Inactive">⛔ Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>

          {/* Role Permissions Info */}
          <Card className="mt-4 border-0 rounded-3" style={{ background: '#f0f4ff' }}>
            <Card.Body className="py-3">
              <div className="fw-semibold mb-2">📋 Role Permissions</div>
              <Row className="g-2 small">
                <Col md={6}>
                  <div className="fw-semibold text-danger mb-1">👑 Super Admin</div>
                  <ul className="mb-0 ps-3">
                    <li>Manage all workers (create, edit, deactivate)</li>
                    <li>Access all system features</li>
                    <li>Reset any user's password</li>
                    <li>System configuration</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <div className="fw-semibold text-primary mb-1">🔑 Admin</div>
                  <ul className="mb-0 ps-3">
                    <li>Manage buses, routes, schedules</li>
                    <li>Manage drivers and passengers</li>
                    <li>View bookings and payments</li>
                    <li>Generate reports</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="rounded-pill px-4 shadow-sm"
            onClick={handleSave}
            disabled={formLoading}
          >
            {formLoading ? (
              <><Spinner size="sm" className="me-1" /> Saving...</>
            ) : (
              editWorker ? '💾 Save Changes' : '➕ Create Worker'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, worker: null })} centered>
        <Modal.Header closeButton className="bg-danger text-white border-0">
          <Modal.Title className="fw-bold">⚠️ Deactivate Worker</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {deleteModal.worker && (
            <div>
              <p>Are you sure you want to deactivate this worker?</p>
              <Card className="border-0 bg-light rounded-3 p-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold"
                    style={{
                      width: 44,
                      height: 44,
                      background: deleteModal.worker.role === 'Super Admin'
                        ? 'linear-gradient(135deg, #dc3545, #fd7e14)'
                        : 'linear-gradient(135deg, #0d6efd, #6f42c1)'
                    }}
                  >
                    {(deleteModal.worker.username || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold">{deleteModal.worker.full_name || deleteModal.worker.username}</div>
                    <div className="text-muted small">@{deleteModal.worker.username} · {deleteModal.worker.role}</div>
                  </div>
                </div>
              </Card>
              <p className="text-muted small mt-3 mb-0">
                The worker account will be set to <strong>Inactive</strong> and they will not be able to log in. You can re-activate them later.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" className="rounded-pill" onClick={() => setDeleteModal({ show: false, worker: null })}>
            Cancel
          </Button>
          <Button variant="danger" className="rounded-pill px-4" onClick={handleDeactivate}>
            ⛔ Deactivate
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WorkersPage;
