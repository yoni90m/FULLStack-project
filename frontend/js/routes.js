/**
 * Bus Transportation Management System
 * Route Management Module: routes.js
 */

let allRoutes = [];

document.addEventListener('DOMContentLoaded', () => {
  loadRoutes();

  const searchInput = document.getElementById('route-search-input');
  const statusFilter = document.getElementById('route-status-filter');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderRoutes);
  if (statusFilter) statusFilter.addEventListener('change', filterAndRenderRoutes);

  const routeForm = document.getElementById('route-modal-form');
  if (routeForm) routeForm.addEventListener('submit', handleRouteFormSubmit);

  const openAddBtn = document.getElementById('btn-open-add-route');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('route-form-id').value = '';
      document.getElementById('route-modal-title').textContent = 'Add New Route';
      routeForm.reset();
      openModal('route-modal');
    });
  }
});

async function loadRoutes() {
  const tableBody = document.getElementById('routes-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading routes...</td></tr>`;

  try {
    const res = await apiFetch('/routes');
    if (res.success && Array.isArray(res.data)) {
      allRoutes = res.data;
      filterAndRenderRoutes();
    } else {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Failed to load routes</td></tr>`;
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Error connecting to routes service</td></tr>`;
  }
}

function filterAndRenderRoutes() {
  const tableBody = document.getElementById('routes-table-body');
  const countBadge = document.getElementById('route-count-badge');
  if (!tableBody) return;

  const searchQuery = (document.getElementById('route-search-input')?.value || '').toLowerCase().trim();
  const selectedStatus = document.getElementById('route-status-filter')?.value || 'all';

  const filtered = allRoutes.filter(route => {
    const matchesSearch = 
      route.origin.toLowerCase().includes(searchQuery) ||
      route.destination.toLowerCase().includes(searchQuery);

    const matchesStatus = (selectedStatus === 'all' || route.status.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Routes`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon">🗺️</div>
            <h3>No routes found</h3>
            <p>Try modifying your search query or status filter.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(r => `
    <tr>
      <td>
        <span class="cell-primary">${escapeHtml(r.origin)} → ${escapeHtml(r.destination)}</span>
        <span class="cell-subtext">Route ID: #${r.route_id}</span>
      </td>
      <td>${escapeHtml(r.origin)}</td>
      <td>${escapeHtml(r.destination)}</td>
      <td><strong>${parseFloat(r.distance).toFixed(1)} km</strong></td>
      <td>⏱️ ${escapeHtml(r.estimated_duration)}</td>
      <td>
        <span class="badge ${r.status === 'Active' ? 'badge-success' : 'badge-danger'}">
          ${r.status}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn" title="Edit Route" onclick="openEditRouteModal(${r.route_id})">
            ✏️
          </button>
          <button class="action-btn delete-action" title="Delete Route" onclick="confirmDeleteRoute(${r.route_id})">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function handleRouteFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('route-form-id').value;
  const origin = document.getElementById('route-origin').value.trim();
  const destination = document.getElementById('route-destination').value.trim();
  const distance = parseFloat(document.getElementById('route-distance').value);
  const estimated_duration = document.getElementById('route-duration').value.trim();
  const fare = parseFloat(document.getElementById('route-fare').value) || 25.00;
  const status = document.getElementById('route-status').value;

  if (!origin || !destination || !estimated_duration) {
    showToast('error', 'Validation Error', 'Origin, Destination, and Estimated Duration are required.');
    return;
  }

  if (origin.toLowerCase() === destination.toLowerCase()) {
    showToast('error', 'Validation Error', 'Origin and Destination cannot be the same city.');
    return;
  }

  if (isNaN(distance) || distance <= 0) {
    showToast('error', 'Validation Error', 'Distance must be a positive number.');
    return;
  }

  const payload = { origin, destination, distance, estimated_duration, fare, status };
  const isEditing = !!id;

  try {
    const res = await apiFetch(isEditing ? `/routes/${id}` : '/routes', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      showToast('success', 'Success', res.message || (isEditing ? 'Route updated' : 'Route created'));
      closeModal('route-modal');
      loadRoutes();
    } else {
      showToast('error', 'Error', res.message || 'Operation failed');
    }
  } catch (err) {
    showToast('error', 'Error', 'Failed to communicate with route service');
  }
}

function openEditRouteModal(routeId) {
  const route = allRoutes.find(r => r.route_id === routeId);
  if (!route) return;

  document.getElementById('route-form-id').value = route.route_id;
  document.getElementById('route-modal-title').textContent = `Edit Route #${route.route_id}`;
  document.getElementById('route-origin').value = route.origin;
  document.getElementById('route-destination').value = route.destination;
  document.getElementById('route-distance').value = route.distance;
  document.getElementById('route-duration').value = route.estimated_duration;
  document.getElementById('route-fare').value = route.fare || 25.00;
  document.getElementById('route-status').value = route.status;

  openModal('route-modal');
}

async function confirmDeleteRoute(routeId) {
  const route = allRoutes.find(r => r.route_id === routeId);
  if (!route) return;

  if (confirm(`Are you sure you want to delete route "${route.origin} → ${route.destination}"?`)) {
    try {
      const res = await apiFetch(`/routes/${routeId}`, { method: 'DELETE' });
      if (res.success) {
        showToast('success', 'Deleted', 'Route deleted successfully.');
        loadRoutes();
      } else {
        showToast('error', 'Error', res.message || 'Could not delete route.');
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to execute delete.');
    }
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
