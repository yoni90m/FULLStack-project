import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import './LiveVehicleMap.css';

const TILE_PROVIDERS = {
  dark: {
    name: 'Dark Transit',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  streets: {
    name: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
  }
};

const LiveVehicleMap = ({
  vehicles = [],
  selectedVehicle = null,
  onSelectVehicle = () => {},
  userLocation = null,
  showAllRoutes = true,
  height = '100%',
  autoFitBounds = false
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routesGroupRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [activeLayerKey, setActiveLayerKey] = useState('dark');
  const [trafficMode, setTrafficMode] = useState(false);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center around Ethiopia transit hub (Addis Ababa)
    const map = L.map(mapContainerRef.current, {
      center: [9.03, 38.74],
      zoom: 7,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer(TILE_PROVIDERS[activeLayerKey].url, {
      attribution: TILE_PROVIDERS[activeLayerKey].attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markersGroupRef.current = L.featureGroup().addTo(map);
    routesGroupRef.current = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when layer key changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);

    const newLayer = L.tileLayer(TILE_PROVIDERS[activeLayerKey].url, {
      attribution: TILE_PROVIDERS[activeLayerKey].attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [activeLayerKey]);

  // Center on Selected Vehicle
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedVehicle) return;
    const lat = selectedVehicle.current_location?.lat;
    const lng = selectedVehicle.current_location?.lng;
    if (lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 13, {
        animate: true,
        duration: 1.2
      });
    }
  }, [selectedVehicle?.bus_id]);

  // Handle User Geolocation Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: 'user-pin-wrapper',
          html: `<div class="user-marker-pin" title="Your Location"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>📍 You are here</b><br/>Your current location');
      }
    } else if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  // Render Vehicle Markers and Routes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !routesGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    routesGroupRef.current.clearLayers();

    vehicles.forEach(vehicle => {
      const lat = vehicle.current_location?.lat;
      const lng = vehicle.current_location?.lng;
      if (!lat || !lng) return;

      const isSelected = selectedVehicle && selectedVehicle.bus_id === vehicle.bus_id;

      // Determine marker color category
      let statusClass = 'moving';
      let iconEmoji = '🚍';
      if (vehicle.status.toLowerCase().includes('maintenance')) {
        statusClass = 'maintenance';
        iconEmoji = '🔧';
      } else if (vehicle.status.toLowerCase().includes('idling') || vehicle.status.toLowerCase().includes('boarding')) {
        statusClass = 'idling';
        iconEmoji = '⏱️';
      } else if (vehicle.status.toLowerCase().includes('depot') || vehicle.status.toLowerCase().includes('inactive')) {
        statusClass = 'depot';
        iconEmoji = '🅿️';
      }

      // Dynamic vehicle marker HTML
      const markerHtml = `
        <div class="vehicle-marker-wrapper ${isSelected ? 'selected' : ''}">
          <div class="vehicle-pin ${statusClass}">
            <div class="vehicle-pulse ${statusClass}"></div>
            <div class="vehicle-heading-arrow" style="transform: rotate(${vehicle.heading || 0}deg);"></div>
            <span style="z-index: 2; font-size: 1.15rem;">${iconEmoji}</span>
          </div>
          <div class="vehicle-label-badge">
            ${vehicle.bus_number} &bull; ${vehicle.speed || 0} km/h
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'vehicle-leaflet-icon',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Rich Tooltip & Popup
      const popupContent = `
        <div class="map-popup-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold text-white mb-0">🚍 ${vehicle.bus_number}</h6>
            <span class="badge ${statusClass === 'moving' ? 'bg-success' : statusClass === 'idling' ? 'bg-warning text-dark' : 'bg-danger'} rounded-pill">
              ${vehicle.status}
            </span>
          </div>
          <div class="text-white-50 small mb-2">${vehicle.plate_number} &bull; ${vehicle.vehicle_type || 'Coach'}</div>
          
          <div class="p-2 rounded-3 mb-2" style="background: rgba(255,255,255,0.06); font-size: 0.82rem;">
            <div class="text-info fw-semibold">🗺️ ${vehicle.route_name || `${vehicle.origin} → ${vehicle.destination}`}</div>
            <div class="text-white-50 mt-1">📍 Near: ${vehicle.current_location?.address || 'On Highway'}</div>
          </div>

          <div class="d-flex justify-content-between text-center small text-white-50 mb-3 pt-1 border-top border-secondary border-opacity-25">
            <div>
              <div class="fw-bold text-white fs-6">${vehicle.speed || 0} <span class="small" style="font-size: 0.65rem;">km/h</span></div>
              <span>Speed</span>
            </div>
            <div>
              <div class="fw-bold text-info fs-6">${vehicle.eta || '--'}</div>
              <span>ETA</span>
            </div>
            <div>
              <div class="fw-bold text-success fs-6">${vehicle.fuel_percent || 80}%</div>
              <span>Fuel</span>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm w-100 rounded-pill py-1 popup-track-btn" id="popup-btn-${vehicle.bus_id}">
              🎯 Focus Car
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectVehicle(vehicle);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${vehicle.bus_id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectVehicle(vehicle);
            mapInstanceRef.current?.flyTo([lat, lng], 14, { animate: true, duration: 1 });
          };
        }
      });

      markersGroupRef.current.addLayer(marker);

      // Draw Route Polyline if selected or if showAllRoutes is enabled
      if (vehicle.route_coordinates && vehicle.route_coordinates.length > 1) {
        if (isSelected || (showAllRoutes && vehicle.status === 'In Transit')) {
          const polyline = L.polyline(vehicle.route_coordinates, {
            color: isSelected ? '#38bdf8' : '#3b82f6',
            weight: isSelected ? 5 : 3,
            opacity: isSelected ? 0.9 : 0.4,
            dashArray: isSelected ? null : '6, 8',
            smoothFactor: 1
          });

          polyline.bindTooltip(`Route: ${vehicle.route_name}`, { sticky: true });
          polyline.on('click', () => onSelectVehicle(vehicle));
          routesGroupRef.current.addLayer(polyline);

          // If selected, add origin and destination markers
          if (isSelected) {
            const startCoord = vehicle.route_coordinates[0];
            const endCoord = vehicle.route_coordinates[vehicle.route_coordinates.length - 1];

            const startIcon = L.divIcon({
              className: 'route-point-icon',
              html: `<div style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">A</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            const endIcon = L.divIcon({
              className: 'route-point-icon',
              html: `<div style="background: #ef4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">B</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            const startMarker = L.marker(startCoord, { icon: startIcon }).bindTooltip(`Origin: ${vehicle.origin}`);
            const endMarker = L.marker(endCoord, { icon: endIcon }).bindTooltip(`Destination: ${vehicle.destination}`);

            routesGroupRef.current.addLayer(startMarker);
            routesGroupRef.current.addLayer(endMarker);
          }
        }
      }
    });

    if (autoFitBounds && vehicles.length > 0 && !selectedVehicle) {
      try {
        const bounds = markersGroupRef.current.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (e) {
        // Safe catch if bounds not ready
      }
    }
  }, [vehicles, selectedVehicle, showAllRoutes, autoFitBounds]);

  const fitAllFleet = () => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    try {
      const bounds = markersGroupRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], animate: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { animate: true });
        }
      },
      (err) => {
        alert('Could not retrieve your location: ' + err.message);
      }
    );
  };

  return (
    <div className="live-map-container" style={{ height }}>
      {/* Map Element */}
      <div ref={mapContainerRef} className="leaflet-map-element" />

      {/* Floating Control Buttons */}
      <div className="map-control-overlay">
        {/* Layer Selector */}
        <div className="d-flex gap-1 bg-dark bg-opacity-75 p-1 rounded-3 backdrop-blur border border-secondary border-opacity-25 shadow">
          {Object.entries(TILE_PROVIDERS).map(([key, provider]) => (
            <button
              key={key}
              className={`btn btn-sm ${activeLayerKey === key ? 'btn-primary' : 'btn-outline-light text-white-50 border-0'} py-1 px-2`}
              style={{ fontSize: '0.75rem', fontWeight: 600 }}
              onClick={() => setActiveLayerKey(key)}
            >
              {provider.name}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <button className="map-btn" onClick={fitAllFleet} title="Show All Fleet">
          <span>🌐</span> Fit Fleet
        </button>
        <button className="map-btn" onClick={locateUser} title="My Location">
          <span>📍</span> My Location
        </button>
      </div>

      {/* Live Status Pill at Bottom */}
      <div className="map-status-pill">
        <span className="d-flex align-items-center gap-2">
          <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: 9, height: 9 }}></span>
          <span className="text-success fw-bold">LIVE GPS FEED</span>
        </span>
        <span className="text-white-50">|</span>
        <span>{vehicles.length} Vehicles Online</span>
        {selectedVehicle && (
          <>
            <span className="text-white-50">|</span>
            <span className="text-info fw-bold">Tracking: {selectedVehicle.bus_number}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveVehicleMap;
