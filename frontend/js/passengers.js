/**
 * Bus Transportation Management System
 * Booked Passenger Manifest: passengers.js
 * Shows passengers who booked tickets, arranged by assigned bus
 */

let allPassengers = [];
let allBookings = [];
let availableBuses = [];

document.addEventListener('DOMContentLoaded', () => {
  loadPassengers();

  const searchInput = document.getElementById('passenger-search-input');
  const busFilter = document.getElementById('passenger-bus-filter');
  const statusFilter = document.getElementById('passenger-status-filter');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderPassengers);
  if (busFilter) busFilter.addEventListener('change', filterAndRenderPassengers);
  if (statusFilter) statusFilter.addEventListener('change', filterAndRenderPassengers);
});

async function loadPassengers() {
  const tableBody = document.getElementById('passengers-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem;">Loading booked passengers...</td></tr>`;

  try {
    const [pRes, bRes, busRes] = await Promise.all([
      apiFetch('/passengers'),
      apiFetch('/bookings'),
      apiFetch('/buses')
    ]);

    if (pRes.success && Array.isArray(pRes.data)) {
      allPassengers = pRes.data;
    }
    if (bRes.success && Array.isArray(bRes.data)) {
      allBookings = bRes.data;
    }
    if (busRes.success && Array.isArray(busRes.data)) {
      availableBuses = busRes.data;
      populateBusFilter(availableBuses);
    }

    filterAndRenderPassengers();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">Failed to load passenger manifest</td></tr>`;
  }
}

function populateBusFilter(buses) {
  const busFilter = document.getElementById('passenger-bus-filter');
  if (!busFilter) return;

  const currentVal = busFilter.value;
  busFilter.innerHTML = '<option value="all">🚍 All Buses</option>';

  buses.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.bus_id;
    opt.textContent = `🚍 ${b.bus_number} (${b.plate_number || b.model || ''})`;
    busFilter.appendChild(opt);
  });

  if (currentVal) busFilter.value = currentVal;
}

function filterAndRenderPassengers() {
  const tableBody = document.getElementById('passengers-table-body');
  const countBadge = document.getElementById('passenger-count-badge');
  if (!tableBody) return;

  const searchQuery = (document.getElementById('passenger-search-input')?.value || '').toLowerCase().trim();
  const selectedBus = document.getElementById('passenger-bus-filter')?.value || 'all';
  const selectedStatus = document.getElementById('passenger-status-filter')?.value || 'all';

  const filtered = allPassengers.filter(p => {
    const nameStr = (p.name || '').toLowerCase();
    const emailStr = (p.email || '').toLowerCase();
    const phoneStr = (p.phone || '').toLowerCase();
    const busStr = (p.bus_number || '').toLowerCase();
    const plateStr = (p.plate_number || '').toLowerCase();
    const routeStr = (p.route_name || '').toLowerCase();
    const refStr = (p.booking_reference || '').toLowerCase();
    const seatStr = (p.seat_number || '').toLowerCase();

    const matchesSearch = 
      nameStr.includes(searchQuery) ||
      emailStr.includes(searchQuery) ||
      phoneStr.includes(searchQuery) ||
      busStr.includes(searchQuery) ||
      plateStr.includes(searchQuery) ||
      routeStr.includes(searchQuery) ||
      refStr.includes(searchQuery) ||
      seatStr.includes(searchQuery);

    const matchesBus = (selectedBus === 'all' || String(p.bus_id) === String(selectedBus));
    const statusVal = p.booking_status || p.status || 'Confirmed';
    const matchesStatus = (selectedStatus === 'all' || statusVal.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesBus && matchesStatus;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Booked Passengers`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <h3>No booked passengers found</h3>
            <p>Passengers only appear here after reserving a bus ticket.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(p => {
    const busBadge = p.bus_number ? `
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span class="badge badge-info" style="font-size: 0.82rem; font-weight: 700; width: fit-content;">
          🚍 ${escapeHtml(p.bus_number)}
        </span>
        <span class="cell-subtext">${escapeHtml(p.plate_number || p.bus_model || 'Standard Bus')}</span>
      </div>
    ` : '<span class="cell-subtext">Unassigned</span>';

    const routeInfo = p.route_name ? `
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span class="cell-primary" style="font-size: 0.88rem;">${escapeHtml(p.route_name)}</span>
        <span class="cell-subtext">🕒 ${p.departure_time || 'Scheduled'}</span>
      </div>
    ` : '<span class="cell-subtext">N/A</span>';

    const seatBadge = p.seat_number ? `
      <span class="badge badge-primary" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; font-size: 0.85rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 6px;">
        💺 ${escapeHtml(p.seat_number)}
      </span>
    ` : '<span class="cell-subtext">N/A</span>';

    const bookingRef = p.booking_reference ? `
      <code style="background: rgba(255,255,255,0.06); padding: 3px 6px; border-radius: 4px; font-weight: 600; color: var(--accent-cyan);">
        ${escapeHtml(p.booking_reference)}
      </code>
    ` : '<span class="cell-subtext">N/A</span>';

    const statusVal = p.booking_status || 'Confirmed';
    const statusClass = statusVal === 'Confirmed' ? 'badge-success' : (statusVal === 'Completed' ? 'badge-info' : 'badge-warning');

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="user-avatar" style="width: 34px; height: 34px; font-size: 0.85rem; background: linear-gradient(135deg, #06b6d4, #3b82f6); flex-shrink: 0;">
              ${(p.name || 'P').charAt(0)}
            </div>
            <div>
              <span class="cell-primary">${escapeHtml(p.name)}</span>
              <span class="cell-subtext">PID: #${p.passenger_id}</span>
            </div>
          </div>
        </td>
        <td>${busBadge}</td>
        <td>${routeInfo}</td>
        <td>${seatBadge}</td>
        <td>${bookingRef}</td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-size: 0.82rem;">✉️ ${escapeHtml(p.email)}</span>
            <span class="cell-subtext">📞 ${escapeHtml(p.phone)}</span>
          </div>
        </td>
        <td>
          <span class="badge ${statusClass}">
            ${escapeHtml(statusVal)}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="action-btn view-action" title="View Trips History" onclick="viewPassengerHistory(${p.passenger_id})">
              👁️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function viewPassengerHistory(passengerId) {
  const p = allPassengers.find(item => item.passenger_id === passengerId);
  const passengerName = p ? p.name : `Passenger #${passengerId}`;
  const passengerBookings = allBookings.filter(b => b.passenger_id === passengerId);
  const container = document.getElementById('passenger-history-list');
  const title = document.getElementById('history-passenger-name');

  if (title) title.textContent = `${passengerName} — Ticket Reservations`;

  if (container) {
    if (passengerBookings.length === 0 && (!p || !p.booking_reference)) {
      container.innerHTML = `<div class="empty-state" style="padding: 2rem;"><p>No booking history recorded for this passenger.</p></div>`;
    } else {
      const displayBookings = passengerBookings.length > 0 ? passengerBookings : [p];
      container.innerHTML = displayBookings.map(b => `
        <div class="activity-item">
          <div class="activity-badge" style="background: rgba(245, 158, 11, 0.14); color: #fbbf24;">🎫</div>
          <div class="activity-details">
            <div class="activity-title">${escapeHtml(b.route_name || 'Trip')} • 🚍 ${escapeHtml(b.bus_number || 'Bus')} (Seat ${escapeHtml(b.seat_number || 'N/A')})</div>
            <div class="activity-time">Ref: ${escapeHtml(b.booking_reference || 'N/A')} • Departure: ${b.departure_time || b.booking_date || 'Scheduled'}</div>
          </div>
          <div>
            <span class="badge ${(b.booking_status || 'Confirmed') === 'Confirmed' ? 'badge-success' : 'badge-danger'}">
              ${b.booking_status || 'Confirmed'}
            </span>
          </div>
        </div>
      `).join('');
    }
  }

  openModal('passenger-history-modal');
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
