/**
 * Bus Transportation Management System
 * Payment Ledger & Transaction Module: payments.js
 */

let allPayments = [];

document.addEventListener('DOMContentLoaded', () => {
  loadPayments();

  const searchInput = document.getElementById('payment-search-input');
  const methodFilter = document.getElementById('payment-method-filter');
  const statusFilter = document.getElementById('payment-status-filter');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderPayments);
  if (methodFilter) methodFilter.addEventListener('change', filterAndRenderPayments);
  if (statusFilter) statusFilter.addEventListener('change', filterAndRenderPayments);
});

async function loadPayments() {
  const tableBody = document.getElementById('payments-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading payment ledger...</td></tr>`;

  try {
    const res = await apiFetch('/payments');
    if (res.success && Array.isArray(res.data)) {
      allPayments = res.data;
      filterAndRenderPayments();
    } else {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Failed to load payments</td></tr>`;
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Error connecting to payments service</td></tr>`;
  }
}

function filterAndRenderPayments() {
  const tableBody = document.getElementById('payments-table-body');
  const countBadge = document.getElementById('payment-count-badge');
  const totalAmountBadge = document.getElementById('payment-total-sum');
  if (!tableBody) return;

  const searchQuery = (document.getElementById('payment-search-input')?.value || '').toLowerCase().trim();
  const selectedMethod = document.getElementById('payment-method-filter')?.value || 'all';
  const selectedStatus = document.getElementById('payment-status-filter')?.value || 'all';

  const filtered = allPayments.filter(p => {
    const txnStr = (p.transaction_reference || '').toLowerCase();
    const passStr = (p.passenger_name || '').toLowerCase();
    const bkStr = (p.booking_reference || '').toLowerCase();

    const matchesSearch = txnStr.includes(searchQuery) || passStr.includes(searchQuery) || bkStr.includes(searchQuery);
    const matchesMethod = (selectedMethod === 'all' || p.payment_method.toLowerCase() === selectedMethod.toLowerCase());
    const matchesStatus = (selectedStatus === 'all' || p.payment_status.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesMethod && matchesStatus;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Transactions`;

  const sumTotal = filtered.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  if (totalAmountBadge) totalAmountBadge.textContent = `ETB ${sumTotal.toFixed(2)}`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon">💳</div>
            <h3>No payment records found</h3>
            <p>Try modifying your search or filter options.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <span class="cell-primary"><code>${escapeHtml(p.transaction_reference)}</code></span>
        <span class="cell-subtext">ID: #${p.payment_id}</span>
      </td>
      <td>
        <div style="font-weight: 600;">${escapeHtml(p.passenger_name || 'Passenger')}</div>
        <span class="cell-subtext">Booking: ${escapeHtml(p.booking_reference || 'N/A')}</span>
      </td>
      <td>
        <span style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--success);">
          ETB ${parseFloat(p.amount).toFixed(2)}
        </span>
      </td>
      <td>
        <span class="badge ${getMethodBadgeClass(p.payment_method)}">
          ${getPaymentMethodIcon(p.payment_method)} ${escapeHtml(p.payment_method)}
        </span>
      </td>
      <td>
        <span class="badge ${p.payment_status === 'Completed' ? 'badge-success' : 'badge-danger'}">
          ${escapeHtml(p.payment_status)}
        </span>
      </td>
      <td>⏱️ ${escapeHtml(p.payment_date)}</td>
      <td>
        <button class="action-btn view-action" title="View Receipt" onclick="viewReceiptModal(${p.payment_id})">
          🧾
        </button>
      </td>
    </tr>
  `).join('');
}

function getMethodBadgeClass(method) {
  switch ((method || '').toLowerCase()) {
    case 'telebirr': return 'badge-success';
    case 'mobile banking': return 'badge-info';
    case 'cash': return 'badge-warning';
    default: return 'badge-info';
  }
}

function getPaymentMethodIcon(method) {
  switch ((method || '').toLowerCase()) {
    case 'telebirr': return '🟢📱';
    case 'mobile banking': return '📱🏦';
    case 'cash': return '💵';
    case 'credit card': return '💳';
    case 'mobile payment': return '📱';
    case 'bank transfer': return '🏦';
    default: return '💰';
  }
}

function openProcessPaymentModal() {
  openModal('process-payment-modal');
}
window.openProcessPaymentModal = openProcessPaymentModal;

function onProcessMethodChanged(method) {
  const telebirrGroup = document.getElementById('pay-telebirr-group');
  const bankGroup = document.getElementById('pay-bank-group');
  const cashGroup = document.getElementById('pay-cash-group');

  if (telebirrGroup) telebirrGroup.style.display = (method === 'Telebirr') ? 'block' : 'none';
  if (bankGroup) bankGroup.style.display = (method === 'Mobile Banking') ? 'block' : 'none';
  if (cashGroup) cashGroup.style.display = (method === 'Cash') ? 'block' : 'none';
}
window.onProcessMethodChanged = onProcessMethodChanged;

async function handleProcessPaymentSubmit(e) {
  e.preventDefault();

  const bookingId = parseInt(document.getElementById('pay-booking-id')?.value, 10);
  const amount = parseFloat(document.getElementById('pay-amount')?.value);
  const method = document.getElementById('pay-method')?.value;
  const phoneNumber = document.getElementById('pay-telebirr-phone')?.value;
  const bankName = document.getElementById('pay-bank-name')?.value;

  if (!bookingId || isNaN(amount) || amount <= 0) {
    showToast('error', 'Validation Error', 'Please provide a valid Booking ID and Amount.');
    return;
  }

  const payload = {
    booking_id: bookingId,
    amount: amount,
    payment_method: method,
    phone_number: method === 'Telebirr' ? phoneNumber : '',
    bank_name: method === 'Mobile Banking' ? bankName : ''
  };

  try {
    const res = await apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      showToast('success', 'Payment Successful!', `Recorded ${method} transaction: ${res.data.transaction_reference}`);
      closeModal('process-payment-modal');
      loadPayments();
    } else {
      showToast('error', 'Payment Failed', res.message || 'Could not process transaction.');
    }
  } catch (err) {
    showToast('error', 'Network Error', 'Failed to communicate with payment gateway.');
  }
}
window.handleProcessPaymentSubmit = handleProcessPaymentSubmit;

function viewReceiptModal(paymentId) {
  const p = allPayments.find(item => item.payment_id === paymentId);
  if (!p) return;

  document.getElementById('receipt-txn').textContent = p.transaction_reference;
  document.getElementById('receipt-passenger').textContent = p.passenger_name || 'Guest Passenger';
  document.getElementById('receipt-booking').textContent = p.booking_reference || 'N/A';
  document.getElementById('receipt-amount').textContent = `ETB ${parseFloat(p.amount).toFixed(2)}`;
  document.getElementById('receipt-method').textContent = `${getPaymentMethodIcon(p.payment_method)} ${p.payment_method}`;
  document.getElementById('receipt-date').textContent = p.payment_date;
  document.getElementById('receipt-status').textContent = p.payment_status;

  openModal('receipt-modal');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}
