/**
 * Bus Transportation Management System
 * Booking & Visual Seat Selection Engine: bookings.js
 */

let allBookings = [];
let allSchedules = [];
let allPassengers = [];
let currentSelectedSchedule = null;
let currentSelectedSeat = null;

document.addEventListener('DOMContentLoaded', () => {
  loadBookingData();

  const searchInput = document.getElementById('booking-search-input');
  const statusFilter = document.getElementById('booking-status-filter');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderBookings);
  if (statusFilter) statusFilter.addEventListener('change', filterAndRenderBookings);

  const openBookModalBtn = document.getElementById('btn-open-book-modal');
  if (openBookModalBtn) {
    openBookModalBtn.addEventListener('click', () => {
      openNewBookingModal();
    });
  }

  // Schedule dropdown change in booking modal
  const scheduleSelect = document.getElementById('book-schedule-select');
  if (scheduleSelect) {
    scheduleSelect.addEventListener('change', (e) => {
      const scheduleId = parseInt(e.target.value, 10);
      onScheduleSelected(scheduleId);
    });
  }

  // Form submit for booking
  const bookingForm = document.getElementById('booking-modal-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleCreateBookingSubmit);
  }
});

async function loadBookingData() {
  const tableBody = document.getElementById('bookings-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem;">Loading bookings...</td></tr>`;

  try {
    const [bRes, sRes, pRes] = await Promise.all([
      apiFetch('/bookings'),
      apiFetch('/schedules'),
      apiFetch('/passengers')
    ]);

    if (bRes.success) allBookings = bRes.data;
    if (sRes.success) allSchedules = sRes.data;
    if (pRes.success) allPassengers = pRes.data;

    filterAndRenderBookings();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">Failed to load bookings</td></tr>`;
  }
}

function filterAndRenderBookings() {
  const tableBody = document.getElementById('bookings-table-body');
  const countBadge = document.getElementById('booking-count-badge');
  if (!tableBody) return;

  const searchQuery = (document.getElementById('booking-search-input')?.value || '').toLowerCase().trim();
  const selectedStatus = document.getElementById('booking-status-filter')?.value || 'all';

  const filtered = allBookings.filter(b => {
    const refStr = (b.booking_reference || '').toLowerCase();
    const passStr = (b.passenger_name || '').toLowerCase();
    const routeStr = (b.route_name || '').toLowerCase();
    const seatStr = (b.seat_number || '').toLowerCase();

    const matchesSearch = refStr.includes(searchQuery) || passStr.includes(searchQuery) || routeStr.includes(searchQuery) || seatStr.includes(searchQuery);
    const matchesStatus = (selectedStatus === 'all' || b.booking_status.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Bookings`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-state-icon">🎫</div>
            <h3>No bookings found</h3>
            <p>Search with different terms or book a new ticket.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(b => `
    <tr>
      <td>
        <span class="cell-primary">🎟️ ${escapeHtml(b.booking_reference)}</span>
        <span class="cell-subtext">Booked: ${b.booking_date}</span>
      </td>
      <td>
        <div style="font-weight: 600;">${escapeHtml(b.passenger_name)}</div>
        <div class="cell-subtext">${escapeHtml(b.passenger_phone || '')}</div>
      </td>
      <td>
        <span class="cell-primary">${escapeHtml(b.route_name || 'N/A')}</span>
        <span class="cell-subtext">Bus: ${escapeHtml(b.bus_number || 'N/A')}</span>
      </td>
      <td>
        <span class="badge badge-purple" style="font-size: 0.85rem; font-weight: 700;">
          💺 Seat ${escapeHtml(b.seat_number)}
        </span>
      </td>
      <td><strong>ETB ${parseFloat(b.fare || 35).toFixed(2)}</strong></td>
      <td>
        <span class="badge ${b.payment_status === 'Completed' ? 'badge-success' : 'badge-warning'}">
          ${escapeHtml(b.payment_method || 'Telebirr')} • ${escapeHtml(b.payment_status || 'Pending')}
        </span>
      </td>
      <td>
        <span class="badge ${getBookingStatusBadgeClass(b.booking_status)}">
          ${escapeHtml(b.booking_status)}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn view-action" title="View Ticket / Boarding Pass" onclick="viewTicketModal(${b.booking_id})">
            📄
          </button>
          ${b.booking_status !== 'Cancelled' ? `
            <button class="action-btn delete-action" title="Cancel Booking" onclick="cancelBooking(${b.booking_id})">
              🚫
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function onPaymentMethodChanged(method) {
  const panelTelebirr = document.getElementById('panel-telebirr');
  const panelMobileBanking = document.getElementById('panel-mobile-banking');
  const panelCash = document.getElementById('panel-cash');

  if (panelTelebirr) panelTelebirr.style.display = (method === 'Telebirr') ? 'block' : 'none';
  if (panelMobileBanking) panelMobileBanking.style.display = (method === 'Mobile Banking') ? 'block' : 'none';
  if (panelCash) panelCash.style.display = (method === 'Cash') ? 'block' : 'none';
}
window.onPaymentMethodChanged = onPaymentMethodChanged;

function openNewBookingModal(preselectedScheduleId = null) {
  const schedSelect = document.getElementById('book-schedule-select');
  const passSelect = document.getElementById('book-passenger-select');
  currentSelectedSeat = null;

  if (schedSelect) {
    schedSelect.innerHTML = '<option value="">-- Choose Schedule / Trip --</option>' +
      allSchedules
        .filter(s => s.status === 'Scheduled' && s.available_seats > 0)
        .map(s => `<option value="${s.schedule_id}">${s.route_name || (s.origin + ' → ' + s.destination)} | ${formatDateTime(s.departure_time)} (ETB ${s.fare})</option>`)
        .join('');

    if (preselectedScheduleId) {
      schedSelect.value = preselectedScheduleId;
    }
  }

  if (passSelect) {
    passSelect.innerHTML = '<option value="">-- Select Passenger --</option>' +
      allPassengers
        .filter(p => p.status === 'Active')
        .map(p => `<option value="${p.passenger_id}">${p.name} (${p.phone})</option>`)
        .join('');
  }

  document.getElementById('seat-selection-display').textContent = 'None';
  document.getElementById('summary-fare').textContent = 'ETB 0.00';
  document.getElementById('summary-total').textContent = 'ETB 0.00';

  const methodSelect = document.getElementById('book-payment-method');
  if (methodSelect) {
    methodSelect.value = 'Telebirr';
    onPaymentMethodChanged('Telebirr');
  }

  if (preselectedScheduleId) {
    onScheduleSelected(preselectedScheduleId);
  } else {
    document.getElementById('seat-grid-container').innerHTML = `
      <div style="text-align: center; color: var(--text-dim); padding: 2rem;">
        Please select a trip schedule above to view the seat map.
      </div>
    `;
  }

  openModal('booking-modal');
}

function onScheduleSelected(scheduleId) {
  currentSelectedSchedule = allSchedules.find(s => s.schedule_id === scheduleId);
  currentSelectedSeat = null;
  document.getElementById('seat-selection-display').textContent = 'None';

  if (!currentSelectedSchedule) {
    document.getElementById('seat-grid-container').innerHTML = '';
    return;
  }

  const fare = parseFloat(currentSelectedSchedule.fare || 35.00);
  document.getElementById('summary-fare').textContent = `ETB ${fare.toFixed(2)}`;
  document.getElementById('summary-total').textContent = `ETB ${fare.toFixed(2)}`;

  renderSeatMap(currentSelectedSchedule);
}

/**
 * Render Interactive Bus Coach Seat Map (Section 11)
 * Rows: 10 rows (1 to 10), letters A, B, [aisle], C, D -> 40 seats
 */
function renderSeatMap(schedule) {
  const container = document.getElementById('seat-grid-container');
  if (!container) return;

  // Find all booked seats for this schedule
  const bookedSeatNumbers = allBookings
    .filter(b => b.schedule_id === schedule.schedule_id && b.booking_status !== 'Cancelled')
    .map(b => b.seat_number.toUpperCase());

  const rows = 10;
  let gridHtml = `
    <div class="bus-coach-frame">
      <div class="bus-front-indicator">🚌 Driver Cabin / Front of Coach</div>
      <div class="seat-grid-coach">
  `;

  for (let r = 1; r <= rows; r++) {
    const seatA = `${r}A`;
    const seatB = `${r}B`;
    const seatC = `${r}C`;
    const seatD = `${r}D`;

    gridHtml += renderSeatButton(seatA, bookedSeatNumbers.includes(seatA));
    gridHtml += renderSeatButton(seatB, bookedSeatNumbers.includes(seatB));
    gridHtml += `<div class="aisle-divider"></div>`;
    gridHtml += renderSeatButton(seatC, bookedSeatNumbers.includes(seatC));
    gridHtml += renderSeatButton(seatD, bookedSeatNumbers.includes(seatD));
  }

  gridHtml += `
      </div>
    </div>
  `;

  container.innerHTML = gridHtml;

  // Add click listeners to available seats
  container.querySelectorAll('.seat-btn:not(.booked)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.seat-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentSelectedSeat = btn.getAttribute('data-seat');
      document.getElementById('seat-selection-display').textContent = `Seat ${currentSelectedSeat}`;
    });
  });
}

function renderSeatButton(seatNum, isBooked) {
  if (isBooked) {
    return `<button type="button" class="seat-btn booked" disabled title="Seat ${seatNum} (Already Booked)">${seatNum}</button>`;
  }
  return `<button type="button" class="seat-btn" data-seat="${seatNum}" title="Available Seat ${seatNum}">${seatNum}</button>`;
}

async function handleCreateBookingSubmit(e) {
  e.preventDefault();

  const schedId = parseInt(document.getElementById('book-schedule-select').value, 10);
  const passId = parseInt(document.getElementById('book-passenger-select').value, 10);
  const paymentMethod = document.getElementById('book-payment-method').value;

  if (!schedId) {
    showToast('error', 'Selection Required', 'Please select a trip schedule.');
    return;
  }
  if (!passId) {
    showToast('error', 'Selection Required', 'Please select a passenger.');
    return;
  }
  if (!currentSelectedSeat) {
    showToast('error', 'Seat Required', 'Please pick a seat from the coach map.');
    return;
  }

  const payload = {
    schedule_id: schedId,
    passenger_id: passId,
    seat_number: currentSelectedSeat,
    payment_method: paymentMethod,
    phone_number: paymentMethod === 'Telebirr' ? (document.getElementById('telebirr-phone')?.value || '') : '',
    bank_name: paymentMethod === 'Mobile Banking' ? (document.getElementById('mobile-banking-bank')?.value || '') : ''
  };

  try {
    const res = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      const channelMsg = paymentMethod === 'Telebirr' ? 'Telebirr payment approved.' : (paymentMethod === 'Mobile Banking' ? 'Mobile Banking verified.' : 'Cash payment recorded.');
      showToast('success', 'Booking Confirmed!', `Seat ${currentSelectedSeat} booked successfully! ${channelMsg}`);
      closeModal('booking-modal');
      loadBookingData();
      if (res.data && res.data.booking_id) {
        setTimeout(() => viewTicketModal(res.data.booking_id), 500);
      }
    } else {
      showToast('error', 'Booking Failed', res.message || 'Unable to complete reservation.');
    }
  } catch (err) {
    showToast('error', 'Error', 'Failed to communicate with booking service.');
  }
}

async function cancelBooking(bookingId) {
  const b = allBookings.find(item => item.booking_id === bookingId);
  if (!b) return;

  if (confirm(`Are you sure you want to cancel booking "${b.booking_reference}" for seat ${b.seat_number}? The seat will be released.`)) {
    try {
      const res = await apiFetch(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify({ booking_status: 'Cancelled' })
      });

      if (res.success) {
        showToast('success', 'Booking Cancelled', 'The booking was cancelled and seat returned to availability.');
        loadBookingData();
      } else {
        showToast('error', 'Error', res.message || 'Failed to cancel booking');
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to execute cancellation');
    }
  }
}

function viewTicketModal(bookingId) {
  const b = allBookings.find(item => item.booking_id === bookingId);
  if (!b) return;

  document.getElementById('ticket-ref').textContent = b.booking_reference;
  document.getElementById('ticket-passenger').textContent = b.passenger_name;
  document.getElementById('ticket-route').textContent = b.route_name || 'Direct Express';
  document.getElementById('ticket-bus').textContent = b.bus_number || 'Express Coach';
  document.getElementById('ticket-seat').textContent = b.seat_number;
  document.getElementById('ticket-departure').textContent = formatDateTime(b.departure_time);
  document.getElementById('ticket-fare').textContent = `ETB ${parseFloat(b.fare || 35).toFixed(2)}`;
  document.getElementById('ticket-status').textContent = b.booking_status;

  openModal('ticket-modal');
}

function getBookingStatusBadgeClass(status) {
  switch (status.toLowerCase()) {
    case 'confirmed': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'completed': return 'badge-info';
    case 'cancelled': return 'badge-danger';
    default: return 'badge-info';
  }
}

function formatDateTime(dtStr) {
  if (!dtStr) return 'TBA';
  try {
    const d = new Date(dtStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dtStr;
  }
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
