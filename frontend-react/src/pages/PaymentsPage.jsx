import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form } from 'react-bootstrap';

const initialPayments = [
  { payment_id: 1, booking_ref: 'TRIP-88201', passenger: 'Alice Smith', amount: 650.00, payment_method: 'Credit Card', payment_status: 'Completed', payment_date: '2026-10-03', transaction_reference: 'TXN-CC-9901823' },
  { payment_id: 2, booking_ref: 'TRIP-88202', passenger: 'Bob Jones', amount: 650.00, payment_method: 'Mobile Payment', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-MP-7729104' },
  { payment_id: 3, booking_ref: 'TRIP-88203', passenger: 'Clara Oswald', amount: 650.00, payment_method: 'Cash', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-CS-1102934' },
  { payment_id: 4, booking_ref: 'TRIP-88204', passenger: 'Alice Smith', amount: 320.00, payment_method: 'Credit Card', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-CC-8829105' },
  { payment_id: 5, booking_ref: 'TRIP-88205', passenger: 'Daniel Craig', amount: 320.00, payment_method: 'Bank Transfer', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-BT-4491028' },
  { payment_id: 6, booking_ref: 'TRIP-88206', passenger: 'Bob Jones', amount: 850.00, payment_method: 'Mobile Payment', payment_status: 'Completed', payment_date: '2026-10-04', transaction_reference: 'TXN-MP-6628190' },
];

const methodVariant = { 'Credit Card': 'primary', 'Mobile Payment': 'info', Cash: 'success', 'Bank Transfer': 'warning' };

const PaymentsPage = () => {
  const [payments] = useState(initialPayments);
  const [search, setSearch] = useState('');

  const filtered = payments.filter(p =>
    p.booking_ref.toLowerCase().includes(search.toLowerCase()) ||
    p.passenger.toLowerCase().includes(search.toLowerCase()) ||
    p.transaction_reference.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col><h4 className="fw-bold">💳 Payment Records</h4></Col>
        <Col xs="auto">
          <Card className="border-0 bg-success bg-opacity-10 shadow-sm rounded-pill px-4 py-2">
            <span className="fw-bold text-success">Total Revenue: ${totalRevenue.toFixed(2)}</span>
          </Card>
        </Col>
      </Row>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Form.Control type="text" placeholder="Search payments..." className="mb-3 rounded-3" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking Ref</th>
                  <th className="d-none d-sm-table-cell">Passenger</th>
                  <th>Amount</th>
                  <th className="d-none d-md-table-cell">Method</th>
                  <th className="d-none d-lg-table-cell">Transaction ID</th>
                  <th className="d-none d-sm-table-cell">Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.payment_id}>
                    <td className="fw-bold text-primary">{p.booking_ref}</td>
                    <td className="d-none d-sm-table-cell">{p.passenger}</td>
                    <td className="fw-bold">${p.amount.toFixed(2)}</td>
                    <td className="d-none d-md-table-cell"><Badge bg={methodVariant[p.payment_method] || 'secondary'} className="rounded-pill px-3 py-2">{p.payment_method}</Badge></td>
                    <td className="d-none d-lg-table-cell"><code className="small">{p.transaction_reference}</code></td>
                    <td className="d-none d-sm-table-cell">{p.payment_date}</td>
                    <td><Badge bg="success" className="rounded-pill px-3 py-2">{p.payment_status}</Badge></td>
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

export default PaymentsPage;
