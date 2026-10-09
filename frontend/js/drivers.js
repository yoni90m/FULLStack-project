/**
 * Bus Transportation Management System
 * Driver Management Module: drivers.js
 */

let allDrivers = [];

document.addEventListener('DOMContentLoaded', () => {
  loadDrivers();

  const searchInput = document.getElementById('driver-search-input');
  const statusFilter = document.getElementById('driver-status-filter');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderDrivers);
  if (statusFilter) statusFilter.addEventListener('change', filterAndRenderDrivers);

  const driverForm = document.getElementById('driver-modal-form');
  if (driverForm) driverForm.addEventListener('submit', handleDriverFormSubmit);

  const openAddBtn = document.getElementById('btn-open-add-driver');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('driver-form-id').value = '';
      document.getElementById('driver-modal-title').textContent = 'Register New Driver';
      driverForm.reset();
      openModal('driver-modal');
    });
  }
});

async function loadDrivers() {
  const tableBody = document.getElementById('drivers-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading drivers...</td></tr>`;

  try {
    const res = await apiFetch('/drivers');
    if (res.success && Array.isArray(res.data)) {
      allDrivers = res.data;
      filterAndRenderDrivers();
    } else {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load drivers</td></tr>`;
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Error connecting to driver directory</td></tr>`;
  }
}

function filterAndRenderDrivers() {
  const tableBody = document.getElementById('drivers-table-body');
  const countBadge = document.getElementById('driver-count-badge');
  if (!tableBody) return;

  const searchQuery = (document.getElementById('driver-search-input')?.value || '').toLowerCase().trim();
  const selectedStatus = document.getElementById('driver-status-filter')?.value || 'all';

  const filtered = allDrivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchQuery) ||
      driver.phone.toLowerCase().includes(searchQuery) ||
      driver.license_number.toLowerCase().includes(searchQuery);

    const matchesStatus = (selectedStatus === 'all' || driver.status.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Drivers`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">👤</div>
            <h3>No drivers found</h3>
            <p>Try modifying your search or filter criteria.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(d => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.8rem;">
            ${(d.name || 'D').charAt(0)}
          </div>
          <div>
            <span class="cell-primary">${escapeHtml(d.name)}</span>
            <span class="cell-subtext">ID: #${d.driver_id}</span>
          </div>
        </div>
      </td>
      <td>📞 ${escapeHtml(d.phone)}</td>
      <td><code>${escapeHtml(d.license_number)}</code></td>
      <td>
        <span class="badge ${getDriverStatusBadgeClass(d.status)}">
          ${escapeHtml(d.status)}
        </span>
      </td>
      <td>
        <span class="badge badge-info">Certified CDL</span>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn" title="Edit Driver" onclick="openEditDriverModal(${d.driver_id})">
            ✏️
          </button>
          <button class="action-btn delete-action" title="Delete Driver" onclick="confirmDeleteDriver(${d.driver_id})">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function handleDriverFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('driver-form-id').value;
  const name = document.getElementById('driver-name').value.trim();
  const phone = document.getElementById('driver-phone').value.trim();
  const license_number = document.getElementById('driver-license').value.trim();
  const status = document.getElementById('driver-status').value;

  if (!name || !phone || !license_number) {
    showToast('error', 'Validation Error', 'Name, phone number, and license number are required.');
    return;
  }

  const payload = { name, phone, license_number, status };
  const isEditing = !!id;

  try {
    const res = await apiFetch(isEditing ? `/drivers/${id}` : '/drivers', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      showToast('success', 'Success', res.message || (isEditing ? 'Driver updated' : 'Driver registered'));
      closeModal('driver-modal');
      loadDrivers();
    } else {
      showToast('error', 'Error', res.message || 'Operation failed');
    }
  } catch (err) {
    showToast('error', 'Error', 'Failed to communicate with driver service');
  }
}

function openEditDriverModal(driverId) {
  const driver = allDrivers.find(d => d.driver_id === driverId);
  if (!driver) return;

  document.getElementById('driver-form-id').value = driver.driver_id;
  document.getElementById('driver-modal-title').textContent = `Edit Driver: ${driver.name}`;
  document.getElementById('driver-name').value = driver.name;
  document.getElementById('driver-phone').value = driver.phone;
  document.getElementById('driver-license').value = driver.license_number;
  document.getElementById('driver-status').value = driver.status;

  openModal('driver-modal');
}

async function confirmDeleteDriver(driverId) {
  const driver = allDrivers.find(d => d.driver_id === driverId);
  if (!driver) return;

  if (confirm(`Are you sure you want to remove driver "${driver.name}"?`)) {
    try {
      const res = await apiFetch(`/drivers/${driverId}`, { method: 'DELETE' });
      if (res.success) {
        showToast('success', 'Deleted', 'Driver removed successfully.');
        loadDrivers();
      } else {
        showToast('error', 'Error', res.message || 'Could not delete driver.');
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to execute delete.');
    }
  }
}

function getDriverStatusBadgeClass(status) {
  switch (status.toLowerCase()) {
    case 'active': return 'badge-success';
    case 'on leave': return 'badge-warning';
    case 'suspended': return 'badge-danger';
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
