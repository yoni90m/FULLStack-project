import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const initialPayments = [
  { payment_id: 1, booking_ref: 'TRIP-88201', passenger: 'Alice Smith', amount: 650.00, payment_method: 'Telebirr', payment_status: 'Completed', payment_date: '2026-10-03', transaction_reference: 'TXN-TB-9901823' },
  { payment_id: 2, booking_ref: 'TRIP-88202', passenger: 'Bob Jones', amount: 650.00, payment_method: 'Mobile Banking', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-MB-7729104' },
  { payment_id: 3, booking_ref: 'TRIP-88203', passenger: 'Clara Oswald', amount: 650.00, payment_method: 'Cash', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-CS-1102934' },
  { payment_id: 4, booking_ref: 'TRIP-88204', passenger: 'Alice Smith', amount: 320.00, payment_method: 'Telebirr', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-TB-8829105' },
  { payment_id: 5, booking_ref: 'TRIP-88205', passenger: 'Daniel Craig', amount: 320.00, payment_method: 'Mobile Banking', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-MB-4491028' },
  { payment_id: 6, booking_ref: 'TRIP-88206', passenger: 'Bob Jones', amount: 850.00, payment_method: 'Cash', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-CS-6628190' },
];

const methodVariant = {
  Telebirr: 'success',
  'Mobile Banking': 'info',
  Cash: 'warning',
  'Credit Card': 'secondary',
  'Bank Transfer': 'primary'
};

const methodIcon = {
  Telebirr: '🟢📱',
  'Mobile Banking': '📱🏦',
  Cash: '💵',
  'Credit Card': '💳',
  'Bank Transfer': '🏦'
};

const PaymentsPage = () => {
  const { authFetch } = useAuth();
  const [payments, setPayments] = useState(initialPayments);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Fetch live payment ledger if backend is running
  useEffect(() => {
    if (authFetch) {
      authFetch('/payments')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setPayments(data.data.map(p => ({
              payment_id: p.payment_id,
              booking_ref: p.booking_reference || `TRIP-${p.booking_id}`,
              passenger: p.passenger_name || 'Passenger',
              amount: parseFloat(p.amount || 0),
              payment_method: p.payment_method || 'Telebirr',
              payment_status: p.payment_status || 'Completed',
              payment_date: p.payment_date ? p.payment_date.split('T')[0] : '2026-10-04',
              transaction_reference: p.transaction_reference
            })));
          }
        })
        .catch(err => console.log('Notice: Fallback to local payment state', err));
    }
  }, [authFetch]);

  const filtered = payments.filter(p => {
    const matchesSearch =
      (p.booking_ref || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.passenger || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.transaction_reference || '').toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === 'All' || p.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalRevenue = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="fw-bold mb-1">💳 Payment Ledger & Cashier Records</h4>
          <p className="text-muted small mb-0">Track transactions across Telebirr, Mobile Banking (CBE, Awash, BoA), and Station Cash.</p>
        </Col>
        <Col xs="auto">
          <Card className="border-0 bg-success bg-opacity-10 shadow-sm rounded-pill px-4 py-2 border border-success border-opacity-25">
            <span className="fw-bold text-success">Total Revenue: ETB {totalRevenue.toFixed(2)}</span>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Row className="g-3 mb-3">
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Search by transaction reference, passenger, or booking..."
                className="rounded-3"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Select
                className="rounded-3"
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
              >
                <option value="All">All Payment Channels</option>
                <option value="Telebirr">🟢 Telebirr</option>
                <option value="Mobile Banking">📱 Mobile Banking (CBE, Awash, BoA)</option>
                <option value="Cash">💵 Cash (Terminal / Counter)</option>
              </Form.Select>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking Ref</th>
                  <th className="d-none d-sm-table-cell">Passenger</th>
                  <th>Amount</th>
                  <th className="d-none d-md-table-cell">Payment Channel</th>
                  <th className="d-none d-lg-table-cell">Transaction Reference</th>
                  <th className="d-none d-sm-table-cell">Timestamp</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No matching payment records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.payment_id}>
                      <td className="fw-bold text-info">{p.booking_ref}</td>
                      <td className="d-none d-sm-table-cell text-white fw-medium">{p.passenger}</td>
                      <td className="fw-bold text-success">ETB {p.amount.toFixed(2)}</td>
                      <td className="d-none d-md-table-cell">
                        <Badge bg={methodVariant[p.payment_method] || 'secondary'} className="rounded-pill px-3 py-2">
                          {methodIcon[p.payment_method] || '💰'} {p.payment_method}
                        </Badge>
                      </td>
                      <td className="d-none d-lg-table-cell"><code className="small">{p.transaction_reference}</code></td>
                      <td className="d-none d-sm-table-cell text-light">{p.payment_date}</td>
                      <td>
                        <Badge bg={p.payment_status === 'Completed' ? 'success' : 'warning'} className="rounded-pill px-3 py-2">
                          {p.payment_status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="rounded-pill px-3"
                          onClick={() => setSelectedReceipt(p)}
                        >
                          🧾 Voucher
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Official Printable Receipt Modal */}
      <Modal show={!!selectedReceipt} onHide={() => setSelectedReceipt(null)} centered>
        <Modal.Header closeButton className="border-secondary border-opacity-25 bg-dark text-white">
          <Modal.Title className="fs-5">🧾 Official Payment Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-4">
          {selectedReceipt && (
            <div className="p-3 border border-secondary border-opacity-50 rounded-3 bg-secondary bg-opacity-10">
              <div className="text-center pb-3 mb-3 border-bottom border-secondary border-opacity-25">
                <h5 className="fw-bold mb-1 text-info">🚌 TransLink Intercity Express</h5>
                <div className="small text-muted">Federal Transport Authority Digital Voucher</div>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Transaction ID:</span>
                <code>{selectedReceipt.transaction_reference}</code>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Passenger:</span>
                <strong>{selectedReceipt.passenger}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Booking Reference:</span>
                <span className="text-info">{selectedReceipt.booking_ref}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Payment Channel:</span>
                <Badge bg={methodVariant[selectedReceipt.payment_method] || 'secondary'}>
                  {methodIcon[selectedReceipt.payment_method] || '💰'} {selectedReceipt.payment_method}
                </Badge>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Status:</span>
                <span className="text-success fw-bold">{selectedReceipt.payment_status}</span>
              </div>
              <div className="d-flex justify-content-between pt-3 mt-3 border-top border-secondary border-opacity-25 align-items-center">
                <span className="fw-bold">Total Settled:</span>
                <span className="fs-4 fw-bold text-success">ETB {selectedReceipt.amount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-secondary border-opacity-25 bg-dark">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setSelectedReceipt(null)}>
            Close
          </Button>
          <Button variant="info" className="rounded-pill px-4 fw-semibold text-dark" onClick={() => window.print()}>
            🖨️ Print Voucher
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentsPage;
