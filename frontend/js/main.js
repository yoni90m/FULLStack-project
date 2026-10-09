/**
 * Bus Transportation Management System
 * Global JavaScript Framework: main.js
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Initial Mock Seed Data matching backend/database/seed.sql
const DEFAULT_SEED_DATA = {
  buses: [
    { bus_id: 1, bus_number: 'BUS-101', plate_number: 'NY-TR-8801', model: 'Volvo 9700 Luxury Cruiser', capacity: 40, status: 'Assigned' },
    { bus_id: 2, bus_number: 'BUS-102', plate_number: 'MA-TR-4422', model: 'Mercedes-Benz Tourismo', capacity: 36, status: 'Available' },
    { bus_id: 3, bus_number: 'BUS-103', plate_number: 'CA-TR-1290', model: 'Scania Touring HD', capacity: 44, status: 'Assigned' },
    { bus_id: 4, bus_number: 'BUS-104', plate_number: 'IL-TR-9031', model: 'MCI J4500 Coach', capacity: 40, status: 'Available' },
    { bus_id: 5, bus_number: 'BUS-105', plate_number: 'WA-TR-3384', model: 'Prevost H3-45 Executive', capacity: 32, status: 'Maintenance' },
    { bus_id: 6, bus_number: 'BUS-106', plate_number: 'TX-TR-5519', model: 'Setra ComfortClass S 515', capacity: 40, status: 'Available' },
    { bus_id: 7, bus_number: 'BUS-107', plate_number: 'FL-TR-7720', model: 'Volvo 9900 VIP Sleeper', capacity: 28, status: 'Inactive' }
  ],
  routes: [
    { route_id: 1, origin: 'Addis Ababa', destination: 'Bahir Dar', distance: 565.0, estimated_duration: '9h 30m', fare: 650.00, status: 'Active' },
    { route_id: 2, origin: 'Addis Ababa', destination: 'Hawassa', distance: 275.0, estimated_duration: '4h 30m', fare: 320.00, status: 'Active' },
    { route_id: 3, origin: 'Addis Ababa', destination: 'Dire Dawa', distance: 445.0, estimated_duration: '7h 45m', fare: 550.00, status: 'Active' },
    { route_id: 4, origin: 'Addis Ababa', destination: 'Mekelle', distance: 780.0, estimated_duration: '12h 00m', fare: 850.00, status: 'Active' },
    { route_id: 5, origin: 'Addis Ababa', destination: 'Jimma', distance: 350.0, estimated_duration: '6h 00m', fare: 420.00, status: 'Active' },
    { route_id: 6, origin: 'Addis Ababa', destination: "Debre Mark'os", distance: 300.0, estimated_duration: '5h 30m', fare: 380.00, status: 'Active' }
  ],
  drivers: [
    { driver_id: 1, user_id: 2, name: 'John Doe', phone: '+1 (555) 234-5678', license_number: 'DL-NY-9023812', status: 'Active' },
    { driver_id: 2, user_id: 3, name: 'Sarah Connor', phone: '+1 (555) 876-5432', license_number: 'DL-CA-4491028', status: 'Active' },
    { driver_id: 3, user_id: 4, name: 'Michael Scott', phone: '+1 (555) 345-6789', license_number: 'DL-PA-1102934', status: 'Active' },
    { driver_id: 4, user_id: null, name: 'David Miller', phone: '+1 (555) 456-7890', license_number: 'DL-IL-5591023', status: 'On Leave' },
    { driver_id: 5, user_id: null, name: 'Emma Watson', phone: '+1 (555) 678-9012', license_number: 'DL-WA-8837192', status: 'Active' }
  ],
  schedules: [
    { schedule_id: 1, bus_id: 1, route_id: 1, driver_id: 1, departure_time: '2026-10-06 08:00:00', arrival_time: '2026-10-06 12:15:00', available_seats: 37, fare: 35.00, status: 'Scheduled' },
    { schedule_id: 2, bus_id: 2, route_id: 1, driver_id: 2, departure_time: '2026-10-07 14:00:00', arrival_time: '2026-10-07 18:15:00', available_seats: 36, fare: 35.00, status: 'Scheduled' },
    { schedule_id: 3, bus_id: 3, route_id: 2, driver_id: 3, departure_time: '2026-10-06 09:30:00', arrival_time: '2026-10-06 16:00:00', available_seats: 42, fare: 55.00, status: 'Scheduled' },
    { schedule_id: 4, bus_id: 4, route_id: 3, driver_id: 5, departure_time: '2026-10-08 10:00:00', arrival_time: '2026-10-08 14:45:00', available_seats: 40, fare: 42.00, status: 'Scheduled' },
    { schedule_id: 5, bus_id: 6, route_id: 4, driver_id: 1, departure_time: '2026-10-09 07:30:00', arrival_time: '2026-10-09 10:50:00', available_seats: 39, fare: 28.00, status: 'Scheduled' }
  ],
  passengers: [
    { passenger_id: 1, user_id: 5, name: 'Alice Smith', phone: '+1 (555) 123-4567', email: 'alice.smith@gmail.com', status: 'Active' },
    { passenger_id: 2, user_id: 6, name: 'Bob Jones', phone: '+1 (555) 987-6543', email: 'bob.jones@yahoo.com', status: 'Active' },
    { passenger_id: 3, user_id: 7, name: 'Clara Oswald', phone: '+1 (555) 654-3210', email: 'clara.oswald@outlook.com', status: 'Active' },
    { passenger_id: 4, user_id: null, name: 'Daniel Craig', phone: '+1 (555) 789-0123', email: 'daniel.craig@gmail.com', status: 'Active' }
  ],
  bookings: [
    { booking_id: 1, booking_reference: 'TRIP-88201', passenger_id: 1, schedule_id: 1, seat_number: '1A', booking_date: '2026-10-03 10:20:00', booking_status: 'Confirmed' },
    { booking_id: 2, booking_reference: 'TRIP-88202', passenger_id: 2, schedule_id: 1, seat_number: '1B', booking_date: '2026-10-04 11:30:00', booking_status: 'Confirmed' },
    { booking_id: 3, booking_reference: 'TRIP-88203', passenger_id: 3, schedule_id: 1, seat_number: '2C', booking_date: '2026-10-04 15:00:00', booking_status: 'Confirmed' },
    { booking_id: 4, booking_reference: 'TRIP-88204', passenger_id: 1, schedule_id: 3, seat_number: '4A', booking_date: '2026-10-04 09:15:00', booking_status: 'Confirmed' },
    { booking_id: 5, booking_reference: 'TRIP-88205', passenger_id: 4, schedule_id: 3, seat_number: '4B', booking_date: '2026-10-04 16:45:00', booking_status: 'Confirmed' },
    { booking_id: 6, booking_reference: 'TRIP-88206', passenger_id: 2, schedule_id: 5, seat_number: '3A', booking_date: '2026-10-04 18:00:00', booking_status: 'Confirmed' }
  ],
  payments: [
    { payment_id: 1, booking_id: 1, amount: 35.00, payment_method: 'Credit Card', payment_status: 'Completed', payment_date: '2026-10-03 10:22:00', transaction_reference: 'TXN-CC-9901823' },
    { payment_id: 2, booking_id: 2, amount: 35.00, payment_method: 'Mobile Payment', payment_status: 'Completed', payment_date: '2026-10-04 11:32:00', transaction_reference: 'TXN-MP-7729104' },
    { payment_id: 3, booking_id: 3, amount: 35.00, payment_method: 'Cash', payment_status: 'Completed', payment_date: '2026-10-04 15:05:00', transaction_reference: 'TXN-CS-1102934' },
    { payment_id: 4, booking_id: 4, amount: 55.00, payment_method: 'Credit Card', payment_status: 'Completed', payment_date: '2026-10-04 09:18:00', transaction_reference: 'TXN-CC-8829105' },
    { payment_id: 5, booking_id: 5, amount: 55.00, payment_method: 'Bank Transfer', payment_status: 'Completed', payment_date: '2026-10-04 16:50:00', transaction_reference: 'TXN-BT-4491028' },
    { payment_id: 6, booking_id: 6, amount: 28.00, payment_method: 'Mobile Payment', payment_status: 'Completed', payment_date: '2026-10-04 18:05:00', transaction_reference: 'TXN-MP-6628190' }
  ]
};

// Initialize or Retrieve Local Storage Store
function getLocalStore() {
  let store = localStorage.getItem('bus_system_db');
  if (!store) {
    localStorage.setItem('bus_system_db', JSON.stringify(DEFAULT_SEED_DATA));
    return DEFAULT_SEED_DATA;
  }
  try {
    return JSON.parse(store);
  } catch (e) {
    localStorage.setItem('bus_system_db', JSON.stringify(DEFAULT_SEED_DATA));
    return DEFAULT_SEED_DATA;
  }
}

function saveLocalStore(data) {
  localStorage.setItem('bus_system_db', JSON.stringify(data));
}

// Current User Session Management
function getCurrentUser() {
  const user = localStorage.getItem('bus_current_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed && typeof parsed === 'object' && (parsed.email || parsed.username || parsed.user_id)) {
        return parsed;
      }
    } catch (e) {
      localStorage.removeItem('bus_current_user');
    }
  }
  return null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('bus_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('bus_current_user');
  }
  updateUIForUser();
}

let isBackendLive = null;

/**
 * Universal API Fetch Client
 * Seamlessly talks to Flask REST endpoints; gracefully uses local reactive store if backend is offline.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('bus_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for swift check
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json = await response.json();
    setApiStatusBadge(true);
    return json;
  } catch (err) {
    // Backend offline or unreachable -> seamless mock fallback
    setApiStatusBadge(false);
    return handleMockApi(endpoint, options);
  }
}

/**
 * Robust Client-Side REST Mock Engine
 * Ensures every single button, CRUD operation, seat booking, and filter works 100%
 */
function handleMockApi(endpoint, options) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const store = getLocalStore();

  const url = new URL(endpoint, 'http://dummy.com');
  const path = url.pathname;
  const segments = path.split('/').filter(Boolean); // e.g. ['buses'], ['buses', '1']
  const resource = segments[0];
  const id = segments[1] ? parseInt(segments[1], 10) : null;

  // 1. AUTH
  if (resource === 'auth') {
    const action = segments[1];
    if (action === 'login') {
      const { username, password } = body;
      if ((username === 'admin' || username === 'admin@translink.com') && password === 'admin123') {
        const user = { user_id: 1, username: 'admin', email: 'admin@translink.com', role: 'Admin', name: 'System Admin' };
        return { success: true, message: 'Login successful', token: 'mock-jwt-admin', user };
      }
      if (username.includes('driver') || password === 'driver123') {
        const user = { user_id: 2, username: username || 'driver_john', email: 'john.doe@translink.com', role: 'Driver', name: 'John Doe' };
        return { success: true, message: 'Login successful', token: 'mock-jwt-driver', user };
      }
      if (password === 'passenger123' || username.includes('smith') || username.includes('passenger')) {
        const user = { user_id: 5, username: username || 'alice_smith', email: 'alice.smith@gmail.com', role: 'Passenger', name: 'Alice Smith' };
        return { success: true, message: 'Login successful', token: 'mock-jwt-passenger', user };
      }
      // General match
      const user = { user_id: 99, username: username || 'demo_user', email: `${username}@translink.com`, role: 'Admin', name: username };
      return { success: true, message: 'Demo Login successful', token: 'mock-jwt-token', user };
    }
    if (action === 'register') {
      return { success: true, message: 'Account registered successfully! You can now log in.' };
    }
    if (action === 'logout') {
      return { success: true, message: 'Logged out successfully' };
    }
    if (action === 'me') {
      return { success: true, user: getCurrentUser() };
    }
  }

  // 2. BUSES
  if (resource === 'buses') {
    if (method === 'GET') {
      if (id) {
        const item = store.buses.find(b => b.bus_id === id);
        return item ? { success: true, data: item } : { success: false, message: 'Bus not found' };
      }
      return { success: true, data: store.buses };
    }
    if (method === 'POST') {
      const newBus = {
        bus_id: Date.now(),
        bus_number: body.bus_number,
        plate_number: body.plate_number,
        model: body.model,
        capacity: parseInt(body.capacity, 10) || 40,
        status: body.status || 'Available',
        created_at: new Date().toISOString()
      };
      store.buses.push(newBus);
      saveLocalStore(store);
      return { success: true, message: 'Bus created successfully', data: newBus };
    }
    if (method === 'PUT' && id) {
      const idx = store.buses.findIndex(b => b.bus_id === id);
      if (idx !== -1) {
        store.buses[idx] = { ...store.buses[idx], ...body };
        saveLocalStore(store);
        return { success: true, message: 'Bus updated successfully', data: store.buses[idx] };
      }
      return { success: false, message: 'Bus not found' };
    }
    if (method === 'DELETE' && id) {
      store.buses = store.buses.filter(b => b.bus_id !== id);
      saveLocalStore(store);
      return { success: true, message: 'Bus deleted successfully' };
    }
  }

  // 3. ROUTES
  if (resource === 'routes') {
    if (method === 'GET') {
      if (id) {
        const item = store.routes.find(r => r.route_id === id);
        return item ? { success: true, data: item } : { success: false, message: 'Route not found' };
      }
      return { success: true, data: store.routes };
    }
    if (method === 'POST') {
      const newRoute = {
        route_id: Date.now(),
        origin: body.origin,
        destination: body.destination,
        distance: parseFloat(body.distance) || 0,
        estimated_duration: body.estimated_duration,
        fare: parseFloat(body.fare) || 25.00,
        status: body.status || 'Active'
      };
      store.routes.push(newRoute);
      saveLocalStore(store);
      return { success: true, message: 'Route created successfully', data: newRoute };
    }
    if (method === 'PUT' && id) {
      const idx = store.routes.findIndex(r => r.route_id === id);
      if (idx !== -1) {
        store.routes[idx] = { ...store.routes[idx], ...body };
        saveLocalStore(store);
        return { success: true, message: 'Route updated successfully', data: store.routes[idx] };
      }
      return { success: false, message: 'Route not found' };
    }
    if (method === 'DELETE' && id) {
      store.routes = store.routes.filter(r => r.route_id !== id);
      saveLocalStore(store);
      return { success: true, message: 'Route deleted successfully' };
    }
  }

  // 4. DRIVERS
  if (resource === 'drivers') {
    if (method === 'GET') {
      if (id) {
        const item = store.drivers.find(d => d.driver_id === id);
        return item ? { success: true, data: item } : { success: false, message: 'Driver not found' };
      }
      return { success: true, data: store.drivers };
    }
    if (method === 'POST') {
      const newDriver = {
        driver_id: Date.now(),
        user_id: null,
        name: body.name,
        phone: body.phone,
        license_number: body.license_number,
        status: body.status || 'Active'
      };
      store.drivers.push(newDriver);
      saveLocalStore(store);
      return { success: true, message: 'Driver registered successfully', data: newDriver };
    }
    if (method === 'PUT' && id) {
      const idx = store.drivers.findIndex(d => d.driver_id === id);
      if (idx !== -1) {
        store.drivers[idx] = { ...store.drivers[idx], ...body };
        saveLocalStore(store);
        return { success: true, message: 'Driver updated successfully', data: store.drivers[idx] };
      }
      return { success: false, message: 'Driver not found' };
    }
    if (method === 'DELETE' && id) {
      store.drivers = store.drivers.filter(d => d.driver_id !== id);
      saveLocalStore(store);
      return { success: true, message: 'Driver deleted successfully' };
    }
  }

  // 5. SCHEDULES
  if (resource === 'schedules') {
    if (method === 'GET') {
      const enriched = store.schedules.map(sch => {
        const bus = store.buses.find(b => b.bus_id === sch.bus_id);
        const route = store.routes.find(r => r.route_id === sch.route_id);
        const driver = store.drivers.find(d => d.driver_id === sch.driver_id);
        return {
          ...sch,
          bus_number: bus ? bus.bus_number : 'N/A',
          route_name: route ? `${route.origin} → ${route.destination}` : 'N/A',
          origin: route ? route.origin : 'N/A',
          destination: route ? route.destination : 'N/A',
          driver_name: driver ? driver.name : 'Unassigned'
        };
      });
      if (id) {
        const item = enriched.find(s => s.schedule_id === id);
        return item ? { success: true, data: item } : { success: false, message: 'Schedule not found' };
      }
      return { success: true, data: enriched };
    }
    if (method === 'POST') {
      const bus = store.buses.find(b => b.bus_id === parseInt(body.bus_id, 10));
      const newSchedule = {
        schedule_id: Date.now(),
        bus_id: parseInt(body.bus_id, 10),
        route_id: parseInt(body.route_id, 10),
        driver_id: parseInt(body.driver_id, 10),
        departure_time: body.departure_time,
        arrival_time: body.arrival_time,
        available_seats: bus ? bus.capacity : 40,
        fare: parseFloat(body.fare) || 25.00,
        status: body.status || 'Scheduled'
      };
      store.schedules.push(newSchedule);
      saveLocalStore(store);
      return { success: true, message: 'Schedule created successfully', data: newSchedule };
    }
    if (method === 'PUT' && id) {
      const idx = store.schedules.findIndex(s => s.schedule_id === id);
      if (idx !== -1) {
        store.schedules[idx] = { ...store.schedules[idx], ...body };
        saveLocalStore(store);
        return { success: true, message: 'Schedule updated successfully', data: store.schedules[idx] };
      }
      return { success: false, message: 'Schedule not found' };
    }
    if (method === 'DELETE' && id) {
      store.schedules = store.schedules.filter(s => s.schedule_id !== id);
      saveLocalStore(store);
      return { success: true, message: 'Schedule deleted successfully' };
    }
  }

  // 6. PASSENGERS (Booked passengers only, arranged by bus)
  if (resource === 'passengers') {
    if (method === 'GET') {
      const bookedManifest = [];
      store.bookings.forEach(b => {
        if (b.booking_status === 'Cancelled') return;
        const pass = store.passengers.find(p => p.passenger_id === b.passenger_id);
        const sch = store.schedules.find(s => s.schedule_id === b.schedule_id);
        const route = sch ? store.routes.find(r => r.route_id === sch.route_id) : null;
        const bus = sch ? store.buses.find(bs => bs.bus_id === sch.bus_id) : null;
        if (pass) {
          bookedManifest.push({
            passenger_id: pass.passenger_id,
            user_id: pass.user_id,
            name: pass.name,
            phone: pass.phone,
            email: pass.email,
            status: pass.status,
            booking_id: b.booking_id,
            booking_reference: b.booking_reference,
            seat_number: b.seat_number,
            booking_status: b.booking_status,
            booking_date: b.booking_date,
            bus_id: bus ? bus.bus_id : null,
            bus_number: bus ? bus.bus_number : 'N/A',
            plate_number: bus ? bus.plate_number : 'N/A',
            bus_model: bus ? bus.model : 'Coach',
            schedule_id: sch ? sch.schedule_id : null,
            departure_time: sch ? sch.departure_time : 'N/A',
            route_name: route ? `${route.origin} → ${route.destination}` : 'N/A'
          });
        }
      });
      if (id) {
        const item = bookedManifest.find(p => p.passenger_id === id);
        return item ? { success: true, data: item } : { success: false, message: 'Passenger not found' };
      }
      return { success: true, data: bookedManifest };
    }
    if (method === 'PUT' && id) {
      const idx = store.passengers.findIndex(p => p.passenger_id === id);
      if (idx !== -1) {
        store.passengers[idx] = { ...store.passengers[idx], ...body };
        saveLocalStore(store);
        return { success: true, message: 'Passenger updated', data: store.passengers[idx] };
      }
      return { success: false, message: 'Passenger not found' };
    }
  }

  // 7. BOOKINGS
  if (resource === 'bookings') {
    if (method === 'GET') {
      const currentUser = getCurrentUser();
      let sourceBookings = store.bookings;
      if (currentUser && currentUser.role === 'Passenger') {
        const pass = store.passengers.find(p => p.user_id === currentUser.user_id || p.email === currentUser.email);
        sourceBookings = pass ? store.bookings.filter(b => b.passenger_id === pass.passenger_id) : [];
      }

      const enriched = sourceBookings.map(b => {
        const pass = store.passengers.find(p => p.passenger_id === b.passenger_id);
        const sch = store.schedules.find(s => s.schedule_id === b.schedule_id);
        const route = sch ? store.routes.find(r => r.route_id === sch.route_id) : null;
        const bus = sch ? store.buses.find(bs => bs.bus_id === sch.bus_id) : null;
        const payment = store.payments.find(pm => pm.booking_id === b.booking_id);
        return {
          ...b,
          passenger_name: pass ? pass.name : 'Unknown Passenger',
          passenger_phone: pass ? pass.phone : 'N/A',
          route_name: route ? `${route.origin} → ${route.destination}` : 'N/A',
          bus_number: bus ? bus.bus_number : 'N/A',
          departure_time: sch ? sch.departure_time : 'N/A',
          fare: sch ? sch.fare : 25.00,
          payment_status: payment ? payment.payment_status : 'Pending',
          payment_method: payment ? payment.payment_method : 'Pending'
        };
      });
      if (id) {
        const item = enriched.find(bk => bk.booking_id === id);
        return item ? { success: true, data: item } : { success: false, message: 'Booking not found' };
      }
      return { success: true, data: enriched };
    }
    if (method === 'POST') {
      const scheduleId = parseInt(body.schedule_id, 10);
      const seatNumber = body.seat_number;
      // Conflict check
      const duplicate = store.bookings.find(b => b.schedule_id === scheduleId && b.seat_number === seatNumber && b.booking_status !== 'Cancelled');
      if (duplicate) {
        return { success: false, message: `Seat ${seatNumber} is already booked for this schedule!` };
      }

      const schIdx = store.schedules.findIndex(s => s.schedule_id === scheduleId);
      if (schIdx !== -1 && store.schedules[schIdx].available_seats > 0) {
        store.schedules[schIdx].available_seats -= 1;
      }

      // Determine passenger
      const currentUser = getCurrentUser();
      let passengerId = body.passenger_id;
      if (!passengerId && currentUser) {
        const passRec = store.passengers.find(p => p.user_id === currentUser.user_id || p.email === currentUser.email);
        if (passRec) {
          passengerId = passRec.passenger_id;
        } else {
          const newP = {
            passenger_id: Date.now(),
            user_id: currentUser.user_id,
            name: currentUser.name || currentUser.username || 'Passenger',
            phone: 'N/A',
            email: currentUser.email,
            status: 'Active'
          };
          store.passengers.push(newP);
          passengerId = newP.passenger_id;
        }
      }

      const newBooking = {
        booking_id: Date.now(),
        booking_reference: `TRIP-${Math.floor(10000 + Math.random() * 90000)}`,
        passenger_id: parseInt(passengerId, 10) || 1,
        schedule_id: scheduleId,
        seat_number: seatNumber,
        booking_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        booking_status: 'Confirmed'
      };
      store.bookings.push(newBooking);

      // Create linked payment record
      const fareAmount = store.schedules[schIdx] ? store.schedules[schIdx].fare : 35.00;
      const newPayment = {
        payment_id: Date.now() + 1,
        booking_id: newBooking.booking_id,
        amount: fareAmount,
        payment_method: body.payment_method || 'Credit Card',
        payment_status: 'Completed',
        payment_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        transaction_reference: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`
      };
      store.payments.push(newPayment);

      saveLocalStore(store);
      return { success: true, message: 'Booking created successfully!', data: newBooking, payment: newPayment };
    }
    if (method === 'PUT' && id) {
      const idx = store.bookings.findIndex(b => b.booking_id === id);
      if (idx !== -1) {
        const oldStatus = store.bookings[idx].booking_status;
        store.bookings[idx] = { ...store.bookings[idx], ...body };
        // If cancelled, return seat
        if (body.booking_status === 'Cancelled' && oldStatus !== 'Cancelled') {
          const schIdx = store.schedules.findIndex(s => s.schedule_id === store.bookings[idx].schedule_id);
          if (schIdx !== -1) {
            store.schedules[schIdx].available_seats += 1;
          }
        }
        saveLocalStore(store);
        return { success: true, message: 'Booking updated successfully', data: store.bookings[idx] };
      }
      return { success: false, message: 'Booking not found' };
    }
    if (method === 'DELETE' && id) {
      store.bookings = store.bookings.filter(b => b.booking_id !== id);
      saveLocalStore(store);
      return { success: true, message: 'Booking deleted' };
    }
  }

  // 8. PAYMENTS
  if (resource === 'payments') {
    if (method === 'GET') {
      const currentUser = getCurrentUser();
      let sourcePayments = store.payments;
      if (currentUser && currentUser.role === 'Passenger') {
        const pass = store.passengers.find(p => p.user_id === currentUser.user_id || p.email === currentUser.email);
        const userBookingIds = pass ? store.bookings.filter(b => b.passenger_id === pass.passenger_id).map(b => b.booking_id) : [];
        sourcePayments = store.payments.filter(pm => userBookingIds.includes(pm.booking_id));
      }

      const enriched = sourcePayments.map(pm => {
        const bk = store.bookings.find(b => b.booking_id === pm.booking_id);
        const pass = bk ? store.passengers.find(p => p.passenger_id === bk.passenger_id) : null;
        return {
          ...pm,
          booking_reference: bk ? bk.booking_reference : 'N/A',
          passenger_name: pass ? pass.name : 'Unknown Passenger'
        };
      });
      if (id) {
        const item = enriched.find(p => p.payment_id === id);
        return item ? { success: true, data: item } : { success: false, message: 'Payment not found' };
      }
      return { success: true, data: enriched };
    }
    if (method === 'POST') {
      const newPayment = {
        payment_id: Date.now(),
        booking_id: parseInt(body.booking_id, 10),
        amount: parseFloat(body.amount) || 0,
        payment_method: body.payment_method || 'Cash',
        payment_status: body.payment_status || 'Completed',
        payment_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        transaction_reference: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`
      };
      store.payments.push(newPayment);
      saveLocalStore(store);
      return { success: true, message: 'Payment recorded successfully', data: newPayment };
    }
  }

  // 9. REPORTS / DASHBOARD STATS
  if (resource === 'reports' || resource === 'dashboard') {
    const totalBuses = store.buses.length;
    const totalDrivers = store.drivers.length;
    const totalRoutes = store.routes.length;
    const totalPassengers = store.passengers.length;
    const totalBookings = store.bookings.length;
    const totalRevenue = store.payments
      .filter(p => p.payment_status === 'Completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return {
      success: true,
      data: {
        total_buses: totalBuses,
        total_drivers: totalDrivers,
        total_routes: totalRoutes,
        total_passengers: totalPassengers,
        total_bookings: totalBookings,
        total_revenue: totalRevenue.toFixed(2),
        active_buses: store.buses.filter(b => b.status === 'Assigned' || b.status === 'Available').length
      }
    };
  }

  return { success: true, data: [] };
}

/**
 * Toast Notification Utility
 */
function showToast(type, title, message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div class="toast-icon">${iconMap[type] || 'ℹ'}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Modal Dialog Helpers
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Update API Status Badge in Navbar
 */
function setApiStatusBadge(isLive) {
  const badge = document.getElementById('api-status-badge');
  if (!badge) return;
  if (isLive) {
    badge.className = 'api-status-chip';
    badge.innerHTML = '<span class="status-dot active"></span> Flask API Live';
    badge.title = 'Connected to Flask REST API at http://127.0.0.1:5000/api';
  } else {
    badge.className = 'api-status-chip mock';
    badge.innerHTML = '<span class="status-dot warning"></span> Demo Mode (Active DB)';
    badge.title = 'Flask server not detected. Operating seamlessly with reactive seed database.';
  }
}

const PUBLIC_PAGES = ['index.html', 'login.html', 'register.html'];

const PAGE_ROLE_PERMISSIONS = {
  'dashboard.html': ['Admin', 'Driver', 'Passenger'],
  'buses.html': ['Admin'],
  'routes.html': ['Admin', 'Driver', 'Passenger'],
  'schedules.html': ['Admin', 'Driver', 'Passenger'],
  'drivers.html': ['Admin'],
  'passengers.html': ['Admin'],
  'bookings.html': ['Admin', 'Passenger'],
  'payments.html': ['Admin', 'Passenger'],
  'reports.html': ['Admin']
};

/**
 * Enforces session authentication and page-level role authorization
 */
function enforceAuthenticationAndRoles() {
  const path = window.location.pathname;
  const pageName = path.split('/').pop() || 'index.html';
  const basePath = path.includes('/pages/') ? '../' : '';

  if (PUBLIC_PAGES.includes(pageName) || pageName === '') {
    return;
  }

  const user = getCurrentUser();
  const token = localStorage.getItem('bus_auth_token');

  if (!user || !token) {
    // Unauthenticated user attempting to access private portal page
    window.location.href = basePath + 'login.html';
    return;
  }

  // Check role authorization for this specific page
  const allowedRoles = PAGE_ROLE_PERMISSIONS[pageName];
  if (allowedRoles) {
    const userRole = (user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRole);
    if (!isAllowed) {
      alert(`Access Denied: Your account role (${user.role}) is not authorized to access ${pageName}. Redirecting to your dashboard.`);
      window.location.href = basePath + 'dashboard.html';
      return;
    }
  }
}

/**
 * Update UI for Logged-In User
 */
function updateUIForUser() {
  const user = getCurrentUser();
  if (!user) return;

  const userNameElements = document.querySelectorAll('.js-user-name');
  const userRoleElements = document.querySelectorAll('.js-user-role');
  const userAvatarElements = document.querySelectorAll('.js-user-avatar');

  const displayName = user.email || user.username || 'User';
  userNameElements.forEach(el => el.textContent = displayName);
  userRoleElements.forEach(el => el.textContent = user.role || 'Passenger');
  userAvatarElements.forEach(el => {
    const initial = (displayName.charAt(0) || 'U').toUpperCase();
    el.textContent = initial;
  });

  // Adjust sidebar navigation visibility strictly based on the real logged-in role
  const userRole = (user.role || '').toLowerCase();
  document.querySelectorAll('[data-role-restricted]').forEach(el => {
    const allowed = el.getAttribute('data-role-restricted').split(',').map(r => r.trim().toLowerCase());
    if (allowed.includes(userRole)) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });

  // Role-specific dashboard layout adjustments
  if (window.location.pathname.endsWith('dashboard.html') || window.location.pathname.endsWith('/dashboard.html')) {
    const welcomeTextH2 = document.querySelector('.welcome-text h2');
    const welcomeTextP = document.querySelector('.welcome-text p');
    if (userRole === 'driver') {
      if (welcomeTextH2) welcomeTextH2.innerHTML = `Welcome to Driver Portal, <span class="js-user-name">${displayName}</span>!`;
      if (welcomeTextP) welcomeTextP.textContent = 'View your assigned coach trips, dispatch schedules, and passenger manifest.';
      const revenueCard = document.querySelector('#kpi-revenue')?.closest('.stat-card');
      if (revenueCard) revenueCard.style.display = 'none';
      const passengersCard = document.querySelector('#kpi-passengers')?.closest('.stat-card');
      if (passengersCard) passengersCard.style.display = 'none';
    } else if (userRole === 'passenger') {
      if (welcomeTextH2) welcomeTextH2.innerHTML = `Welcome to Passenger Portal, <span class="js-user-name">${displayName}</span>!`;
      if (welcomeTextP) welcomeTextP.textContent = 'Browse available intercity routes, select your seats, and manage your tickets.';
      const revenueCard = document.querySelector('#kpi-revenue')?.closest('.stat-card');
      if (revenueCard) revenueCard.style.display = 'none';
      const driversCard = document.querySelector('#kpi-drivers')?.closest('.stat-card');
      if (driversCard) driversCard.style.display = 'none';
    }
  }
}

/**
 * Global Page Initializer
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check auth and role access on every page load
  enforceAuthenticationAndRoles();

  // Mobile Sidebar Toggle
  const toggleBtn = document.getElementById('mobile-toggle');
  const sidebar = document.querySelector('.app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      if (backdrop) backdrop.classList.toggle('active');
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }

  // Active Link Highlight in Sidebar
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.sidebar-menu .nav-item');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (currentPath.endsWith(href) || (currentPath.endsWith('/') && href.includes('dashboard.html')))) {
      link.classList.add('active');
    }
  });

  // Close modals when clicking backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Logout Handlers
  const logoutButtons = document.querySelectorAll('.js-logout-btn');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch (err) {}
      localStorage.removeItem('bus_auth_token');
      localStorage.removeItem('bus_current_user');
      showToast('info', 'Logged Out', 'You have been successfully logged out.');
      
      const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
      setTimeout(() => {
        window.location.href = basePath + 'login.html';
      }, 500);
    });
  });

  // Test API connectivity
  apiFetch('/reports/stats');
  updateUIForUser();
});
