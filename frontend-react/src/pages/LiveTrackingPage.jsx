import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, ProgressBar } from 'react-bootstrap';
import LiveVehicleMap from '../components/LiveVehicleMap';
import './LiveTrackingPage.css';

const INITIAL_FLEET = [
  {
    bus_id: 1,
    bus_number: 'BUS-101',
    plate_number: 'NY-TR-8801',
    vehicle_type: 'Volvo 9700 Luxury Cruiser',
    driver_name: 'Abebe Bekele',
    driver_phone: '+251 911 234 567',
    driver_rating: 4.9,
    route_name: 'Addis Ababa → Bahir Dar',
    origin: 'Addis Ababa',
    destination: 'Bahir Dar',
    status: 'In Transit',
    current_location: {
      lat: 9.6800,
      lng: 38.1300,
      address: 'Gojjam Highway, near Dejen'
    },
    speed: 72,
    heading: 335,
    fuel_percent: 82,
    passengers: 38,
    capacity: 40,
    eta: '3h 45m',
    next_stop: 'Dejen Gorge Rest Station',
    progress_percent: 45,
    engine_temp: '88°C',
    tire_pressure: '32 PSI (Normal)',
    route_coordinates: [
      [9.0300, 38.7400],
      [9.1800, 38.7500],
      [9.6800, 38.1300],
      [10.1600, 38.1400],
      [10.6000, 37.7300],
      [11.5900, 37.3900]
    ]
  },
  {
    bus_id: 2,
    bus_number: 'BUS-102',
    plate_number: 'MA-TR-4422',
    vehicle_type: 'Mercedes-Benz Tourismo',
    driver_name: 'Samuel Tadesse',
    driver_phone: '+251 922 345 678',
    driver_rating: 4.8,
    route_name: 'Addis Ababa → Hawassa',
    origin: 'Addis Ababa',
    destination: 'Hawassa',
    status: 'In Transit',
    current_location: {
      lat: 8.2000,
      lng: 38.8800,
      address: 'Hawassa Toll Expressway'
    },
    speed: 85,
    heading: 175,
    fuel_percent: 68,
    passengers: 34,
    capacity: 36,
    eta: '1h 15m',
    next_stop: 'Batu (Ziway) Terminal',
    progress_percent: 62,
    engine_temp: '90°C',
    tire_pressure: '33 PSI (Normal)',
    route_coordinates: [
      [9.0100, 38.7600],
      [8.7500, 38.9800],
      [8.4500, 38.9900],
      [7.9300, 38.7100],
      [7.0600, 38.4800]
    ]
  },
  {
    bus_id: 3,
    bus_number: 'BUS-103',
    plate_number: 'CA-TR-1290',
    vehicle_type: 'Scania Touring HD',
    driver_name: 'Mulugeta Haile',
    driver_phone: '+251 933 456 789',
    driver_rating: 4.7,
    route_name: 'Addis Ababa → Dire Dawa',
    origin: 'Addis Ababa',
    destination: 'Dire Dawa',
    status: 'In Transit',
    current_location: {
      lat: 8.9800,
      lng: 40.0500,
      address: 'Awash Valley Highway'
    },
    speed: 64,
    heading: 85,
    fuel_percent: 54,
    passengers: 42,
    capacity: 44,
    eta: '2h 50m',
    next_stop: 'Awash National Park Gate',
    progress_percent: 52,
    engine_temp: '89°C',
    tire_pressure: '32 PSI (Normal)',
    route_coordinates: [
      [9.0100, 38.7600],
      [8.9800, 39.2200],
      [8.9800, 40.0500],
      [9.2300, 40.7500],
      [9.6000, 41.8600]
    ]
  },
  {
    bus_id: 4,
    bus_number: 'BUS-104',
    plate_number: 'IL-TR-9031',
    vehicle_type: 'MCI J4500 Coach',
    driver_name: 'Dawit Tesfaye',
    driver_phone: '+251 944 567 890',
    driver_rating: 4.9,
    route_name: 'Addis Ababa → Jimma',
    origin: 'Addis Ababa',
    destination: 'Jimma',
    status: 'In Transit',
    current_location: {
      lat: 8.5400,
      lng: 37.9700,
      address: 'Welkite Mountain Pass'
    },
    speed: 58,
    heading: 240,
    fuel_percent: 74,
    passengers: 36,
    capacity: 40,
    eta: '2h 10m',
    next_stop: 'Abelti River Station',
    progress_percent: 50,
    engine_temp: '87°C',
    tire_pressure: '31 PSI (Normal)',
    route_coordinates: [
      [9.0200, 38.7400],
      [8.7300, 38.3800],
      [8.5400, 37.9700],
      [8.0000, 37.4000],
      [7.6700, 36.8300]
    ]
  },
  {
    bus_id: 5,
    bus_number: 'BUS-105',
    plate_number: 'WA-TR-3384',
    vehicle_type: 'Prevost H3-45 Executive',
    driver_name: 'Kassahun Girma',
    driver_phone: '+251 955 678 901',
    driver_rating: 4.6,
    route_name: 'Addis Ababa Maintenance Depot',
    origin: 'Central Station',
    destination: 'Service Bay',
    status: 'Maintenance',
    current_location: {
      lat: 9.0050,
      lng: 38.7850,
      address: 'Bole Fleet Workshop'
    },
    speed: 0,
    heading: 0,
    fuel_percent: 42,
    passengers: 0,
    capacity: 32,
    eta: 'Scheduled Inspection',
    next_stop: 'Bay 3 (Oil Change)',
    progress_percent: 0,
    engine_temp: '25°C',
    tire_pressure: '30 PSI (Inspecting)',
    route_coordinates: [
      [9.0050, 38.7850]
    ]
  },
  {
    bus_id: 6,
    bus_number: 'BUS-106',
    plate_number: 'TX-TR-5519',
    vehicle_type: 'Setra ComfortClass S 515',
    driver_name: 'Ermias Wolde',
    driver_phone: '+251 966 789 012',
    driver_rating: 4.85,
    route_name: 'Addis Ababa → Debre Mark\'os',
    origin: 'Addis Ababa',
    destination: 'Debre Mark\'os',
    status: 'Boarding / Idling',
    current_location: {
      lat: 9.0450,
      lng: 38.7550,
      address: 'Autobis Tera Main Terminal Platform 7'
    },
    speed: 0,
    heading: 10,
    fuel_percent: 96,
    passengers: 28,
    capacity: 40,
    eta: 'Departs in 12 min',
    next_stop: 'Sululta Toll Gate',
    progress_percent: 5,
    engine_temp: '65°C',
    tire_pressure: '32 PSI (Normal)',
    route_coordinates: [
      [9.0450, 38.7550],
      [9.5000, 38.6000],
      [10.3500, 37.7300]
    ]
  }
];

const LiveTrackingPage = () => {
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [selectedVehicle, setSelectedVehicle] = useState(INITIAL_FLEET[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch live telemetry from backend with fallback
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/tracking');
      if (res.ok) {
        const data = await res.json();
        if (data.data?.vehicles) {
          setFleet(data.data.vehicles);
          setLastUpdated(new Date());
          return;
        }
      }
    } catch (e) {
      // Backend not running yet or CORS; continue smoothly with client simulation
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Real-time Motion Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setFleet(prevFleet => {
        return prevFleet.map(vehicle => {
          if (vehicle.status !== 'In Transit' || !vehicle.route_coordinates || vehicle.route_coordinates.length < 2) {
            return vehicle;
          }

          // Advance vehicle slightly along its path
          const coords = vehicle.route_coordinates;
          const currentLat = vehicle.current_location.lat;
          const currentLng = vehicle.current_location.lng;

          // Compute next simulated micro step
          const stepSize = 0.0012 * simSpeed;
          const jitterLat = (Math.random() - 0.48) * stepSize;
          const jitterLng = (Math.random() - 0.48) * stepSize;

          const newLat = currentLat + jitterLat;
          const newLng = currentLng + jitterLng;

          const speedDelta = Math.floor(Math.random() * 7) - 3;
          const newSpeed = Math.max(45, Math.min(95, vehicle.speed + speedDelta));

          const updated = {
            ...vehicle,
            current_location: {
              ...vehicle.current_location,
              lat: Number(newLat.toFixed(5)),
              lng: Number(newLng.toFixed(5))
            },
            speed: newSpeed,
            fuel_percent: Math.max(15, vehicle.fuel_percent - 0.01 * simSpeed),
            progress_percent: Math.min(99, vehicle.progress_percent + 0.1 * simSpeed)
          };

          return updated;
        });
      });

      setLastUpdated(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Keep selectedVehicle synchronized with fleet state updates
  useEffect(() => {
    if (!selectedVehicle) return;
    const current = fleet.find(v => v.bus_id === selectedVehicle.bus_id);
    if (current) {
      setSelectedVehicle(current);
    }
  }, [fleet]);

  // Filtered fleet list
  const filteredVehicles = fleet.filter(v => {
    const matchesSearch =
      v.bus_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.route_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'MOVING') return matchesSearch && v.status === 'In Transit';
    if (filterStatus === 'IDLE') return matchesSearch && (v.status.includes('Boarding') || v.status.includes('Idling'));
    if (filterStatus === 'MAINTENANCE') return matchesSearch && v.status.includes('Maintenance');
    return matchesSearch;
  });

  const movingCount = fleet.filter(v => v.status === 'In Transit').length;
  const idlingCount = fleet.filter(v => v.status.includes('Boarding') || v.status.includes('Idling')).length;
  const totalPassengers = fleet.reduce((acc, v) => acc + (v.passengers || 0), 0);

  return (
    <Container fluid className="tracking-page-container p-4">
      {/* Top Banner & KPI Bar */}
      <div className="tracking-hero p-4 rounded-4 text-white mb-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="pulse-dot-live"></span>
              <h3 className="fw-bold mb-0">Real-Time Vehicle GPS Tracking</h3>
              <Badge bg="primary" className="rounded-pill px-3 py-1">GPS Fleet Live</Badge>
            </div>
            <p className="text-white-50 mb-0 small">
              Live telemetry, precise GPS coordinates, speed, route trajectories & driver communication.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Simulation controls */}
            <Button
              variant={isSimulating ? 'outline-success' : 'outline-warning'}
              size="sm"
              className="rounded-pill px-3 fw-semibold"
              onClick={() => setIsSimulating(!isSimulating)}
            >
              {isSimulating ? '▶ Sim: Active' : '⏸ Sim: Paused'}
            </Button>
            <div className="btn-group btn-group-sm">
              <Button
                variant={simSpeed === 1 ? 'primary' : 'outline-secondary'}
                onClick={() => setSimSpeed(1)}
              >
                1x
              </Button>
              <Button
                variant={simSpeed === 2 ? 'primary' : 'outline-secondary'}
                onClick={() => setSimSpeed(2)}
              >
                2x
              </Button>
              <Button
                variant={simSpeed === 5 ? 'primary' : 'outline-secondary'}
                onClick={() => setSimSpeed(5)}
              >
                5x Fast
              </Button>
            </div>
            <Button
              variant="outline-light"
              size="sm"
              className="rounded-pill px-3"
              onClick={fetchTelemetry}
            >
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <Row className="g-3 mt-3 pt-3 border-top border-secondary border-opacity-25">
          <Col xs={6} md={3}>
            <div className="text-white-50 small">Total Monitored Fleet</div>
            <div className="fs-4 fw-bold text-white">{fleet.length} <span className="fs-6 text-white-50 fw-normal">Vehicles</span></div>
          </Col>
          <Col xs={6} md={3}>
            <div className="text-white-50 small">Vehicles In Motion</div>
            <div className="fs-4 fw-bold text-success">{movingCount} <span className="fs-6 text-white-50 fw-normal">Moving</span></div>
          </Col>
          <Col xs={6} md={3}>
            <div className="text-white-50 small">En-Route Passengers</div>
            <div className="fs-4 fw-bold text-info">{totalPassengers} <span className="fs-6 text-white-50 fw-normal">Onboard</span></div>
          </Col>
          <Col xs={6} md={3}>
            <div className="text-white-50 small">Last GPS Sync</div>
            <div className="fs-5 fw-bold text-warning font-monospace">{lastUpdated.toLocaleTimeString()}</div>
          </Col>
        </Row>
      </div>

      {/* Main Grid: Fleet Selector + Map + Telemetry HUD */}
      <Row className="g-4">
        {/* Left Column: Fleet List & Search */}
        <Col lg={4} xl={3}>
          <Card className="fleet-list-card border-0 rounded-4 shadow-sm p-3">
            <h6 className="fw-bold text-white mb-3 d-flex justify-content-between align-items-center">
              <span>🚗 Vehicle Fleet</span>
              <Badge bg="secondary" className="rounded-pill">{filteredVehicles.length}</Badge>
            </h6>

            {/* Search Input */}
            <Form.Control
              type="text"
              placeholder="Search bus, plate, route, driver..."
              className="bg-dark text-white border-secondary mb-3 rounded-3"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            />

            {/* Filter Tabs */}
            <div className="d-flex gap-1 mb-3 pb-2 border-bottom border-secondary border-opacity-25 flex-wrap">
              <Button
                size="sm"
                variant={filterStatus === 'ALL' ? 'primary' : 'outline-secondary'}
                className="rounded-pill py-0 px-2"
                style={{ fontSize: '0.75rem' }}
                onClick={() => setFilterStatus('ALL')}
              >
                All ({fleet.length})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'MOVING' ? 'success' : 'outline-secondary'}
                className="rounded-pill py-0 px-2"
                style={{ fontSize: '0.75rem' }}
                onClick={() => setFilterStatus('MOVING')}
              >
                Moving ({movingCount})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'IDLE' ? 'warning' : 'outline-secondary'}
                className="rounded-pill py-0 px-2 text-dark"
                style={{ fontSize: '0.75rem' }}
                onClick={() => setFilterStatus('IDLE')}
              >
                Idle ({idlingCount})
              </Button>
            </div>

            {/* Scrollable Vehicle Cards */}
            <div className="fleet-scroll-area">
              {filteredVehicles.map(vehicle => {
                const isSelected = selectedVehicle?.bus_id === vehicle.bus_id;
                const isMoving = vehicle.status === 'In Transit';

                return (
                  <div
                    key={vehicle.bus_id}
                    className={`vehicle-item-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <div className="fw-bold text-white d-flex align-items-center gap-2">
                          <span>🚍 {vehicle.bus_number}</span>
                          <span className="small text-white-50 font-monospace" style={{ fontSize: '0.75rem' }}>{vehicle.plate_number}</span>
                        </div>
                        <div className="small text-info fw-semibold text-truncate" style={{ maxWidth: '180px' }}>
                          {vehicle.route_name}
                        </div>
                      </div>
                      <Badge
                        bg={isMoving ? 'success' : vehicle.status.includes('Boarding') ? 'warning' : 'danger'}
                        className="rounded-pill"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {isMoving ? `${vehicle.speed} km/h` : vehicle.status}
                      </Badge>
                    </div>

                    <div className="d-flex justify-content-between align-items-center small text-white-50 mt-2">
                      <span>👨‍✈️ {vehicle.driver_name}</span>
                      <span>👥 {vehicle.passengers}/{vehicle.capacity}</span>
                    </div>

                    <div className="mt-2">
                      <div className="d-flex justify-content-between text-white-50" style={{ fontSize: '0.7rem' }}>
                        <span>Fuel: {vehicle.fuel_percent.toFixed(0)}%</span>
                        <span>ETA: {vehicle.eta}</span>
                      </div>
                      <ProgressBar
                        now={vehicle.fuel_percent}
                        variant={vehicle.fuel_percent > 40 ? 'success' : 'warning'}
                        style={{ height: '4px' }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Center & Right Column: Interactive Map & Live Telemetry Panel */}
        <Col lg={8} xl={9}>
          {/* Map Container */}
          <div className="mb-4" style={{ height: '540px' }}>
            <LiveVehicleMap
              vehicles={fleet}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={setSelectedVehicle}
              height="100%"
            />
          </div>

          {/* Selected Vehicle Telemetry HUD */}
          {selectedVehicle && (
            <Card className="telemetry-card text-white p-4 shadow-lg border-0">
              <Row className="align-items-center g-4">
                {/* Vehicle Header & Driver Info */}
                <Col md={4} className="border-end border-secondary border-opacity-25">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-primary bg-opacity-25 border border-primary text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: 52, height: 52, fontSize: '1.6rem' }}>
                      🚍
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0 text-white">{selectedVehicle.bus_number}</h5>
                      <span className="text-white-50 small">{selectedVehicle.vehicle_type} &bull; {selectedVehicle.plate_number}</span>
                    </div>
                  </div>

                  <div className="telemetry-stat-box mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-white-50 small">Assigned Driver</span>
                      <span className="text-warning small fw-bold">⭐ {selectedVehicle.driver_rating || '4.8'}</span>
                    </div>
                    <div className="fw-bold">{selectedVehicle.driver_name}</div>
                    <div className="small text-info font-monospace">{selectedVehicle.driver_phone}</div>
                  </div>
                </Col>

                {/* Live GPS Coordinates & Real-time Gauges */}
                <Col md={4} className="border-end border-secondary border-opacity-25">
                  <div className="row g-2 text-center">
                    <div className="col-6">
                      <div className="telemetry-stat-box">
                        <div className="text-white-50 small">Live Speed</div>
                        <div className="fs-3 fw-bold text-success font-monospace">{selectedVehicle.speed} <span className="fs-6 text-white-50">km/h</span></div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="telemetry-stat-box">
                        <div className="text-white-50 small">Fuel Level</div>
                        <div className="fs-3 fw-bold text-info font-monospace">{selectedVehicle.fuel_percent.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="telemetry-stat-box text-start">
                        <div className="text-white-50 small">📍 Exact GPS Fix</div>
                        <div className="fw-bold font-monospace small text-primary">
                          {selectedVehicle.current_location.lat.toFixed(5)}° N, {selectedVehicle.current_location.lng.toFixed(5)}° E
                        </div>
                        <div className="text-white-50 text-truncate" style={{ fontSize: '0.78rem' }}>
                          Near: {selectedVehicle.current_location.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Route Progress & ETA */}
                <Col md={4}>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-white-50 small">Trip Route</span>
                      <Badge bg="primary" className="rounded-pill">{selectedVehicle.eta}</Badge>
                    </div>
                    <div className="fw-bold text-info text-truncate">{selectedVehicle.origin} ➔ {selectedVehicle.destination}</div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between small text-white-50 mb-1">
                      <span>Trip Progress</span>
                      <span>{selectedVehicle.progress_percent.toFixed(0)}%</span>
                    </div>
                    <ProgressBar
                      now={selectedVehicle.progress_percent}
                      variant="info"
                      style={{ height: '8px' }}
                      className="rounded-pill"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center small text-white-50 mb-3">
                    <span>Next Stop:</span>
                    <span className="text-white fw-bold">{selectedVehicle.next_stop}</span>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-100 rounded-pill py-2 fw-semibold"
                      onClick={() => alert(`Calling driver ${selectedVehicle.driver_name} at ${selectedVehicle.driver_phone}`)}
                    >
                      📞 Call Driver
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="w-100 rounded-pill py-2"
                      onClick={() => alert(`Telemetry Report:\nVehicle: ${selectedVehicle.bus_number}\nEngine Temp: ${selectedVehicle.engine_temp}\nTires: ${selectedVehicle.tire_pressure}`)}
                    >
                      📊 Diagnostics
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default LiveTrackingPage;
