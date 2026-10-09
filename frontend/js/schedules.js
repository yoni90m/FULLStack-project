/**
 * Bus Transportation Management System
 * Schedule Management Module: schedules.js
 */

let allSchedules = [];
let allBuses = [];
let allRoutes = [];
let allDrivers = [];

document.addEventListener('DOMContentLoaded', () => {
  loadPrerequisitesAndSchedules();

  const searchInput = document.getElementById('schedule-search-input');
  const statusFilter = document.getElementById('schedule-status-filter');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderSchedules);
  if (statusFilter) statusFilter.addEventListener('change', filterAndRenderSchedules);

  const scheduleForm = document.getElementById('schedule-modal-form');
  if (scheduleForm) scheduleForm.addEventListener('submit', handleScheduleFormSubmit);

  const openAddBtn = document.getElementById('btn-open-add-schedule');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('schedule-form-id').value = '';
      document.getElementById('schedule-modal-title').textContent = 'Create New Schedule';
      scheduleForm.reset();
      populateSelectOptions();
      openModal('schedule-modal');
    });
  }
});

async function loadPrerequisitesAndSchedules() {
  try {
    const [busesRes, routesRes, driversRes, schedRes] = await Promise.all([
      apiFetch('/buses'),
      apiFetch('/routes'),
      apiFetch('/drivers'),
      apiFetch('/schedules')
    ]);

    if (busesRes.success) allBuses = busesRes.data;
    if (routesRes.success) allRoutes = routesRes.data;
    if (driversRes.success) allDrivers = driversRes.data;
    if (schedRes.success) {
      allSchedules = schedRes.data;
      filterAndRenderSchedules();
    }
    populateSelectOptions();
  } catch (err) {
    showToast('error', 'Error', 'Failed to load schedule prerequisites');
  }
}

function populateSelectOptions() {
  const busSelect = document.getElementById('sched-bus');
  const routeSelect = document.getElementById('sched-route');
  const driverSelect = document.getElementById('sched-driver');

  if (busSelect) {
    busSelect.innerHTML = '<option value="">-- Select Bus --</option>' + 
      allBuses.map(b => `<option value="${b.bus_id}">${b.bus_number} (${b.model} - ${b.capacity} seats) [${b.status}]</option>`).join('');
  }
  if (routeSelect) {
    routeSelect.innerHTML = '<option value="">-- Select Route --</option>' + 
      allRoutes.map(r => `<option value="${r.route_id}">${r.origin} → ${r.destination} ($${r.fare})</option>`).join('');
  }
  if (driverSelect) {
    driverSelect.innerHTML = '<option value="">-- Select Driver --</option>' + 
      allDrivers.map(d => `<option value="${d.driver_id}">${d.name} (${d.phone}) [${d.status}]</option>`).join('');
  }
}

function filterAndRenderSchedules() {
  const tableBody = document.getElementById('schedules-table-body');
  const countBadge = document.getElementById('schedule-count-badge');
  if (!tableBody) return;

  const searchQuery = (document.getElementById('schedule-search-input')?.value || '').toLowerCase().trim();
  const selectedStatus = document.getElementById('schedule-status-filter')?.value || 'all';

  const filtered = allSchedules.filter(sch => {
    const busStr = (sch.bus_number || '').toLowerCase();
    const routeStr = (sch.route_name || `${sch.origin} ${sch.destination}`).toLowerCase();
    const driverStr = (sch.driver_name || '').toLowerCase();

    const matchesSearch = busStr.includes(searchQuery) || routeStr.includes(searchQuery) || driverStr.includes(searchQuery);
    const matchesStatus = (selectedStatus === 'all' || sch.status.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Schedules`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-state-icon">🕒</div>
            <h3>No schedules found</h3>
            <p>Try modifying your filter or create a new trip schedule.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(s => {
    const routeName = s.route_name || (s.origin && s.destination ? `${s.origin} → ${s.destination}` : `Route #${s.route_id}`);
    const busName = s.bus_number || `Bus #${s.bus_id}`;
    const driverName = s.driver_name || `Driver #${s.driver_id}`;

    return `
      <tr>
        <td>
          <span class="cell-primary">${escapeHtml(routeName)}</span>
          <span class="cell-subtext">Schedule ID: #${s.schedule_id}</span>
        </td>
        <td>🚌 <strong>${escapeHtml(busName)}</strong></td>
        <td>👤 ${escapeHtml(driverName)}</td>
        <td>
          <div>🛫 ${formatDateTime(s.departure_time)}</div>
          <div class="cell-subtext">🛬 ${formatDateTime(s.arrival_time)}</div>
        </td>
        <td>
          <span class="badge ${s.available_seats > 10 ? 'badge-success' : 'badge-warning'}">
            ${s.available_seats} Seats Left
          </span>
        </td>
        <td><strong>$${parseFloat(s.fare || 25).toFixed(2)}</strong></td>
        <td>
          <span class="badge ${getScheduleStatusBadgeClass(s.status)}">
            ${escapeHtml(s.status)}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="action-btn" title="Edit Schedule" onclick="openEditScheduleModal(${s.schedule_id})">
              ✏️
            </button>
            <button class="action-btn delete-action" title="Delete Schedule" onclick="confirmDeleteSchedule(${s.schedule_id})">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleScheduleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('schedule-form-id').value;
  const bus_id = parseInt(document.getElementById('sched-bus').value, 10);
  const route_id = parseInt(document.getElementById('sched-route').value, 10);
  const driver_id = parseInt(document.getElementById('sched-driver').value, 10);
  const departure_time = document.getElementById('sched-dept-time').value;
  const arrival_time = document.getElementById('sched-arr-time').value;
  const fare = parseFloat(document.getElementById('sched-fare').value) || 25.00;
  const status = document.getElementById('sched-status').value;

  if (!bus_id || !route_id || !driver_id || !departure_time || !arrival_time) {
    showToast('error', 'Validation Error', 'All schedule fields are required.');
    return;
  }

  const deptDate = new Date(departure_time);
  const arrDate = new Date(arrival_time);

  if (arrDate <= deptDate) {
    showToast('error', 'Time Error', 'Arrival time must be after the departure time.');
    return;
  }

  // Conflict Detection: Bus or Driver overlapping assignments
  const currentSchedId = id ? parseInt(id, 10) : null;
  const conflict = allSchedules.find(s => {
    if (s.schedule_id === currentSchedId || s.status === 'Cancelled') return false;
    const sDept = new Date(s.departure_time);
    const sArr = new Date(s.arrival_time);
    const timeOverlap = (deptDate < sArr && arrDate > sDept);

    if (timeOverlap) {
      if (s.bus_id === bus_id) {
        showToast('error', 'Bus Conflict', `This bus is already assigned to a schedule during this time period.`);
        return true;
      }
      if (s.driver_id === driver_id) {
        showToast('error', 'Driver Conflict', `This driver is already assigned to a schedule during this time period.`);
        return true;
      }
    }
    return false;
  });

  if (conflict) return;

  const payload = { bus_id, route_id, driver_id, departure_time, arrival_time, fare, status };
  const isEditing = !!id;

  try {
    const res = await apiFetch(isEditing ? `/schedules/${id}` : '/schedules', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      showToast('success', 'Success', res.message || (isEditing ? 'Schedule updated' : 'Schedule created'));
      closeModal('schedule-modal');
      loadPrerequisitesAndSchedules();
    } else {
      showToast('error', 'Error', res.message || 'Operation failed');
    }
  } catch (err) {
    showToast('error', 'Error', 'Failed to communicate with schedule service');
  }
}

function openEditScheduleModal(schedId) {
  const sched = allSchedules.find(s => s.schedule_id === schedId);
  if (!sched) return;

  populateSelectOptions();

  document.getElementById('schedule-form-id').value = sched.schedule_id;
  document.getElementById('schedule-modal-title').textContent = `Edit Schedule #${sched.schedule_id}`;
  document.getElementById('sched-bus').value = sched.bus_id;
  document.getElementById('sched-route').value = sched.route_id;
  document.getElementById('sched-driver').value = sched.driver_id;
  document.getElementById('sched-dept-time').value = sched.departure_time.replace(' ', 'T').substring(0, 16);
  document.getElementById('sched-arr-time').value = sched.arrival_time.replace(' ', 'T').substring(0, 16);
  document.getElementById('sched-fare').value = sched.fare || 25.00;
  document.getElementById('sched-status').value = sched.status;

  openModal('schedule-modal');
}

async function confirmDeleteSchedule(schedId) {
  const sched = allSchedules.find(s => s.schedule_id === schedId);
  if (!sched) return;

  if (confirm(`Are you sure you want to cancel / delete this schedule?`)) {
    try {
      const res = await apiFetch(`/schedules/${schedId}`, { method: 'DELETE' });
      if (res.success) {
        showToast('success', 'Deleted', 'Schedule cancelled and removed.');
        loadPrerequisitesAndSchedules();
      } else {
        showToast('error', 'Error', res.message || 'Could not delete schedule.');
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to execute delete.');
    }
  }
}

function getScheduleStatusBadgeClass(status) {
  switch (status.toLowerCase()) {
    case 'scheduled': return 'badge-info';
    case 'boarding': return 'badge-warning';
    case 'in transit': return 'badge-purple';
    case 'completed': return 'badge-success';
    case 'cancelled': return 'badge-danger';
    default: return 'badge-info';
  }
}

function formatDateTime(dtStr) {
  if (!dtStr) return 'N/A';
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
