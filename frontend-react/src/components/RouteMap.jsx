import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import './RouteMap.css';

// Well-known coordinates for Ethiopian cities and transit hubs
export const CITY_COORDINATES = {
  'Addis Ababa': [9.0300, 38.7400],
  'Bahir Dar': [11.5900, 37.3900],
  'Hawassa': [7.0600, 38.4800],
  'Dire Dawa': [9.5931, 41.8661],
  'Mekelle': [13.4967, 39.4753],
  'Jimma': [7.6734, 36.8344],
  "Debre Mark'os": [10.3326, 37.7258],
  'Debre Markos': [10.3326, 37.7258],
  'Gondar': [12.6075, 37.4521],
  'Adama': [8.5400, 39.2700],
  'Nazret': [8.5400, 39.2700],
  'Harar': [9.3139, 42.1182],
  'Arba Minch': [6.0333, 37.5500],
  'Dessie': [11.1300, 39.6300],
  'Shashemene': [7.2000, 38.6000],
  'Bishoftu': [8.7500, 38.9800]
};

// Route color palette for visual distinction
const ROUTE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
];

const TILE_LAYERS = {
  streets: {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  dark: {
    name: 'Dark Transit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Dark Gray Canvas'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  }
};

const getCityLatLng = (cityName) => {
  if (!cityName) return null;
  const trimmed = cityName.trim();
  if (CITY_COORDINATES[trimmed]) return CITY_COORDINATES[trimmed];
  const found = Object.keys(CITY_COORDINATES).find(
    k => k.toLowerCase() === trimmed.toLowerCase()
  );
  return found ? CITY_COORDINATES[found] : null;
};

const RouteMap = ({
  routes = [],
  selectedRoute = null,
  onSelectRoute = () => {},
  height = '420px',
  theme = 'light' // 'light' or 'dark'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routeLayersRef = useRef([]);
  const markerLayersRef = useRef([]);

  const [activeTile, setActiveTile] = useState(theme === 'dark' ? 'dark' : 'streets');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [9.03, 38.74],
      zoom: 6,
      zoomControl: true,
      attributionControl: false
    });

    const tile = L.tileLayer(TILE_LAYERS[activeTile].url, {
      attribution: TILE_LAYERS[activeTile].attribution,
      maxZoom: 18
    }).addTo(map);

    tileLayerRef.current = tile;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer when activeTile changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(TILE_LAYERS[activeTile].url, {
      attribution: TILE_LAYERS[activeTile].attribution,
      maxZoom: 18
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [activeTile]);

  // Render Routes and Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear previous layers
    routeLayersRef.current.forEach(layer => map.removeLayer(layer));
    markerLayersRef.current.forEach(layer => map.removeLayer(layer));
    routeLayersRef.current = [];
    markerLayersRef.current = [];

    const allLatLngs = [];

    routes.forEach((route, idx) => {
      const originCoords = getCityLatLng(route.origin);
      const destCoords = getCityLatLng(route.destination);

      if (!originCoords || !destCoords) return;

      const isSelected = selectedRoute && selectedRoute.route_id === route.route_id;
      const color = isSelected ? '#ef4444' : ROUTE_COLORS[idx % ROUTE_COLORS.length];
      const weight = isSelected ? 5 : 3.5;
      const opacity = selectedRoute ? (isSelected ? 1 : 0.35) : 0.85;

      // Draw polyline connecting origin and destination
      const polyline = L.polyline([originCoords, destCoords], {
        color: color,
        weight: weight,
        opacity: opacity,
        dashArray: isSelected ? null : '6, 6'
      }).addTo(map);

      polyline.on('click', () => onSelectRoute(route));

      // Tooltip on hover
      polyline.bindTooltip(
        `<b>${route.origin} → ${route.destination}</b><br/>📏 ${route.distance} km | ⏱️ ${route.estimated_duration || 'N/A'} | ETB ${route.fare}`,
        { sticky: true, className: 'route-map-tooltip' }
      );

      routeLayersRef.current.push(polyline);
      allLatLngs.push(originCoords, destCoords);

      // Create Custom Origin Marker
      const originIcon = L.divIcon({
        className: 'custom-map-pin origin-pin',
        html: `<div class="pin-inner origin ${isSelected ? 'highlight' : ''}"><span>A</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const originMarker = L.marker(originCoords, { icon: originIcon }).addTo(map);
      originMarker.bindPopup(`
        <div class="route-pin-popup">
          <div class="pin-tag origin">Origin</div>
          <h6>${route.origin}</h6>
          <p class="mb-0 text-muted">To ${route.destination}</p>
        </div>
      `);
      originMarker.on('click', () => onSelectRoute(route));
      markerLayersRef.current.push(originMarker);

      // Create Custom Destination Marker
      const destIcon = L.divIcon({
        className: 'custom-map-pin dest-pin',
        html: `<div class="pin-inner dest ${isSelected ? 'highlight' : ''}"><span>B</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(map);
      destMarker.bindPopup(`
        <div class="route-pin-popup">
          <div class="pin-tag dest">Destination</div>
          <h6>${route.destination}</h6>
          <p class="mb-0 text-muted">From ${route.origin}</p>
          <div class="mt-1 font-monospace fw-bold text-primary">Fare: ETB ${route.fare}</div>
        </div>
      `);
      destMarker.on('click', () => onSelectRoute(route));
      markerLayersRef.current.push(destMarker);
    });

    // Auto-fit bounds
    if (selectedRoute) {
      const o = getCityLatLng(selectedRoute.origin);
      const d = getCityLatLng(selectedRoute.destination);
      if (o && d) {
        map.fitBounds([o, d], { padding: [50, 50], maxZoom: 9, animate: true });
      }
    } else if (allLatLngs.length > 0) {
      map.fitBounds(allLatLngs, { padding: [40, 40], animate: true });
    }
  }, [routes, selectedRoute]);

  const resetView = () => {
    if (!mapInstanceRef.current) return;
    onSelectRoute(null);
    mapInstanceRef.current.flyTo([9.03, 38.74], 6, { duration: 0.8 });
  };

  return (
    <div className="route-map-container" style={{ height }}>
      <div ref={mapContainerRef} className="route-map-leaflet" />

      {/* Map Control Bar Overlay */}
      <div className="route-map-controls">
        <div className="btn-group btn-group-sm shadow-sm">
          {Object.entries(TILE_LAYERS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`btn btn-sm ${activeTile === key ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setActiveTile(key)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-sm btn-light shadow-sm ms-2"
          onClick={resetView}
          title="Reset View"
        >
          🔄 Reset View
        </button>
      </div>

      {/* Selected Route Info Card Overlay */}
      {selectedRoute && (
        <div className="selected-route-overlay shadow-lg">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="badge bg-danger rounded-pill px-2 py-1">Selected Corridor</span>
            <button
              className="btn-close btn-close-sm"
              style={{ fontSize: '0.65rem' }}
              onClick={() => onSelectRoute(null)}
              aria-label="Close"
            />
          </div>
          <h6 className="fw-bold mb-1 text-dark">
            {selectedRoute.origin} <span className="text-danger">➔</span> {selectedRoute.destination}
          </h6>
          <div className="d-flex gap-3 text-muted small mt-2">
            <div><strong>📏 Distance:</strong> {selectedRoute.distance} km</div>
            <div><strong>⏱️ Time:</strong> {selectedRoute.estimated_duration}</div>
            <div><strong>💵 Fare:</strong> ETB {selectedRoute.fare}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
