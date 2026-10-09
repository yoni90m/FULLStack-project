/**
 * Bus Transportation Management System
 * Reports & Analytics Engine: reports.js
 */

document.addEventListener('DOMContentLoaded', () => {
  loadReports();

  const exportBtn = document.getElementById('btn-export-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportReportsToCsv);
  }

  const printBtn = document.getElementById('btn-print-report');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
});

async function loadReports() {
  try {
    const [busesRes, routesRes, schedRes, bookRes, payRes] = await Promise.all([
      apiFetch('/buses'),
      apiFetch('/routes'),
      apiFetch('/schedules'),
      apiFetch('/bookings'),
      apiFetch('/payments')
    ]);

    const buses = busesRes.data || [];
    const routes = routesRes.data || [];
    const schedules = schedRes.data || [];
    const bookings = bookRes.data || [];
    const payments = payRes.data || [];

    // Financial KPIs
    const totalRevenue = payments
      .filter(p => p.payment_status === 'Completed')
      .reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);

    const confirmedBookings = bookings.filter(b => b.booking_status === 'Confirmed');
    const avgFare = confirmedBookings.length > 0 ? (totalRevenue / confirmedBookings.length) : 0;

    // Fleet utilization
    const activeBuses = buses.filter(b => b.status === 'Assigned' || b.status === 'Available');
    const utilizationRate = buses.length > 0 ? Math.round((activeBuses.length / buses.length) * 100) : 0;

    // Update KPI UI
    document.getElementById('report-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('report-confirmed-count').textContent = `${confirmedBookings.length}`;
    document.getElementById('report-avg-fare').textContent = `$${avgFare.toFixed(2)}`;
    document.getElementById('report-fleet-util').textContent = `${utilizationRate}%`;

    // Render Route Performance Breakdown Table
    renderRoutePerformance(routes, schedules, bookings, payments);

    // Render Bus Fleet Utilization Table
    renderFleetStatusReport(buses, schedules);

  } catch (err) {
    showToast('error', 'Error', 'Failed to generate comprehensive reports');
  }
}

function renderRoutePerformance(routes, schedules, bookings, payments) {
  const container = document.getElementById('route-performance-body');
  if (!container) return;

  const routeData = routes.map(route => {
    const routeSchedules = schedules.filter(s => s.route_id === route.route_id);
    const scheduleIds = routeSchedules.map(s => s.schedule_id);
    const routeBookings = bookings.filter(b => scheduleIds.includes(b.schedule_id) && b.booking_status === 'Confirmed');
    const revenue = routeBookings.length * parseFloat(route.fare || 25);

    return {
      name: `${route.origin} → ${route.destination}`,
      tripsScheduled: routeSchedules.length,
      bookingsCount: routeBookings.length,
      distance: route.distance,
      revenue: revenue
    };
  });

  // Sort by revenue descending
  routeData.sort((a, b) => b.revenue - a.revenue);

  container.innerHTML = routeData.map(r => `
    <tr>
      <td><span class="cell-primary">${escapeHtml(r.name)}</span></td>
      <td><strong>${r.tripsScheduled}</strong> Scheduled</td>
      <td><span class="badge badge-info">${r.bookingsCount} Tickets</span></td>
      <td>${parseFloat(r.distance).toFixed(1)} km</td>
      <td><strong style="color: var(--success); font-size: 1.05rem;">$${r.revenue.toFixed(2)}</strong></td>
    </tr>
  `).join('');
}

function renderFleetStatusReport(buses, schedules) {
  const container = document.getElementById('fleet-report-body');
  if (!container) return;

  container.innerHTML = buses.map(bus => {
    const assignedTrips = schedules.filter(s => s.bus_id === bus.bus_id);

    return `
      <tr>
        <td>
          <span class="cell-primary">${escapeHtml(bus.bus_number)}</span>
          <span class="cell-subtext">${escapeHtml(bus.plate_number)}</span>
        </td>
        <td>${escapeHtml(bus.model)}</td>
        <td>${bus.capacity} Seats</td>
        <td><strong>${assignedTrips.length}</strong> Trips Assigned</td>
        <td>
          <span class="badge ${getBusBadge(bus.status)}">
            ${escapeHtml(bus.status)}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function exportReportsToCsv() {
  const table = document.querySelector('.data-table');
  if (!table) return;

  let csv = [];
  const rows = table.querySelectorAll('tr');

  for (let i = 0; i < rows.length; i++) {
    const row = [], cols = rows[i].querySelectorAll('td, th');
    for (let j = 0; j < cols.length; j++) {
      let text = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s+)/gm, ' ');
      text = text.replace(/"/g, '""');
      row.push(`"${text}"`);
    }
    csv.push(row.join(','));
  }

  const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
  const downloadLink = document.createElement('a');
  downloadLink.download = `bus_system_report_${new Date().toISOString().substring(0, 10)}.csv`;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  showToast('success', 'Exported', 'CSV report downloaded successfully.');
}

function getBusBadge(status) {
  switch (status.toLowerCase()) {
    case 'available': return 'badge-success';
    case 'assigned': return 'badge-info';
    case 'maintenance': return 'badge-warning';
    default: return 'badge-danger';
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
