/**
 * Bus Transportation Management System
 * Bus Management Module: buses.js
 */

let allBuses = [];

document.addEventListener('DOMContentLoaded', () => {
  loadBuses();

  // Search and Filter Listeners
  const searchInput = document.getElementById('bus-search-input');
  const statusFilter = document.getElementById('bus-status-filter');

  if (searchInput) {
    searchInput.addEventListener('input', filterAndRenderBuses);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterAndRenderBuses);
  }

  // Add / Edit Bus Form Handler
  const busForm = document.getElementById('bus-modal-form');
  if (busForm) {
    busForm.addEventListener('submit', handleBusFormSubmit);
  }

  // Open Add Bus Modal
  const openAddBtn = document.getElementById('btn-open-add-bus');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('bus-form-id').value = '';
      document.getElementById('bus-modal-title').textContent = 'Add New Bus';
      busForm.reset();
      openModal('bus-modal');
    });
  }
});

/**
 * Fetch buses from API
 */
async function loadBuses() {
  const tableBody = document.getElementById('buses-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading bus fleet...</td></tr>`;

  try {
    const res = await apiFetch('/buses');
    if (res.success && Array.isArray(res.data)) {
      allBuses = res.data;
      filterAndRenderBuses();
    } else {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load buses</td></tr>`;
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Error connecting to fleet service</td></tr>`;
  }
}

/**
 * Filter and render buses
 */
function filterAndRenderBuses() {
  const tableBody = document.getElementById('buses-table-body');
  const countBadge = document.getElementById('bus-count-badge');
  if (!tableBody) return;

  const searchQuery = (document.getElementById('bus-search-input')?.value || '').toLowerCase().trim();
  const selectedStatus = document.getElementById('bus-status-filter')?.value || 'all';

  const filtered = allBuses.filter(bus => {
    const matchesSearch = 
      bus.bus_number.toLowerCase().includes(searchQuery) ||
      bus.plate_number.toLowerCase().includes(searchQuery) ||
      bus.model.toLowerCase().includes(searchQuery);

    const matchesStatus = (selectedStatus === 'all' || bus.status.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Buses`;
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">🚌</div>
            <h3>No buses found</h3>
            <p>Try refining your search terms or filter by another status.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(bus => `
    <tr>
      <td>
        <span class="cell-primary">${escapeHtml(bus.bus_number)}</span>
        <span class="cell-subtext">ID: #${bus.bus_id}</span>
      </td>
      <td><strong>${escapeHtml(bus.plate_number)}</strong></td>
      <td>${escapeHtml(bus.model)}</td>
      <td>
        <span style="font-weight: 600;">${bus.capacity}</span> Seats
      </td>
      <td>
        <span class="badge ${getStatusBadgeClass(bus.status)}">
          ${escapeHtml(bus.status)}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn" title="Edit Bus" onclick="openEditBusModal(${bus.bus_id})">
            ✏️
          </button>
          <button class="action-btn delete-action" title="Delete Bus" onclick="confirmDeleteBus(${bus.bus_id})">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Handle Add/Edit Bus Form Submission
 */
async function handleBusFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('bus-form-id').value;
  const bus_number = document.getElementById('bus-number').value.trim();
  const plate_number = document.getElementById('bus-plate').value.trim();
  const model = document.getElementById('bus-model').value.trim();
  const capacity = parseInt(document.getElementById('bus-capacity').value, 10);
  const status = document.getElementById('bus-status').value;

  // Validation
  if (!bus_number || !plate_number || !model) {
    showToast('error', 'Validation Error', 'Bus Number, Plate Number, and Model are required.');
    return;
  }

  if (isNaN(capacity) || capacity <= 0 || capacity > 100) {
    showToast('error', 'Validation Error', 'Capacity must be a positive number between 1 and 100.');
    return;
  }

  const payload = { bus_number, plate_number, model, capacity, status };
  const isEditing = !!id;

  try {
    const res = await apiFetch(isEditing ? `/buses/${id}` : '/buses', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      showToast('success', 'Success', res.message || (isEditing ? 'Bus updated' : 'Bus created'));
      closeModal('bus-modal');
      loadBuses();
    } else {
      showToast('error', 'Error', res.message || 'Operation failed');
    }
  } catch (err) {
    showToast('error', 'Error', 'Failed to communicate with bus service');
  }
}

/**
 * Open Modal to edit a bus
 */
function openEditBusModal(busId) {
  const bus = allBuses.find(b => b.bus_id === busId);
  if (!bus) return;

  document.getElementById('bus-form-id').value = bus.bus_id;
  document.getElementById('bus-modal-title').textContent = `Edit Bus ${bus.bus_number}`;
  document.getElementById('bus-number').value = bus.bus_number;
  document.getElementById('bus-plate').value = bus.plate_number;
  document.getElementById('bus-model').value = bus.model;
  document.getElementById('bus-capacity').value = bus.capacity;
  document.getElementById('bus-status').value = bus.status;

  openModal('bus-modal');
}

/**
 * Confirm and delete bus
 */
async function confirmDeleteBus(busId) {
  const bus = allBuses.find(b => b.bus_id === busId);
  if (!bus) return;

  if (confirm(`Are you sure you want to remove bus "${bus.bus_number}" (${bus.plate_number}) from the fleet?`)) {
    try {
      const res = await apiFetch(`/buses/${busId}`, { method: 'DELETE' });
      if (res.success) {
        showToast('success', 'Deleted', 'Bus removed successfully.');
        loadBuses();
      } else {
        showToast('error', 'Error', res.message || 'Could not delete bus.');
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to execute delete.');
    }
  }
}

function getStatusBadgeClass(status) {
  switch (status.toLowerCase()) {
    case 'available': return 'badge-success';
    case 'assigned': return 'badge-info';
    case 'maintenance': return 'badge-warning';
    case 'inactive': return 'badge-danger';
    default: return 'badge-info';
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
