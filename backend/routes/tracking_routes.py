from flask import Blueprint, request
from backend.utils.helpers import json_response
from backend.utils.security import auth_required
import random
import time

tracking_bp = Blueprint('tracking_bp', __name__)

# Sample realistic vehicle positions & routes for real-time tracking
VEHICLE_FLEET = [
    {
        "bus_id": 1,
        "bus_number": "BUS-101",
        "plate_number": "NY-TR-8801",
        "vehicle_type": "Luxury Coach",
        "driver_name": "Abebe Bekele",
        "driver_phone": "+251 911 234 567",
        "route_name": "Addis Ababa → Bahir Dar",
        "origin": "Addis Ababa",
        "destination": "Bahir Dar",
        "status": "In Transit",
        "current_location": {
            "lat": 9.0300,
            "lng": 38.7400,
            "address": "Gojjam Road, near Sululta"
        },
        "speed": 68,
        "heading": 340,
        "fuel_percent": 84,
        "passengers": 38,
        "capacity": 40,
        "eta": "4h 15m",
        "next_stop": "Dejen Bridge",
        "route_coordinates": [
            [9.0300, 38.7400],
            [9.1800, 38.7500],
            [9.6800, 38.1300],
            [10.1600, 38.1400],
            [10.6000, 37.7300],
            [11.5900, 37.3900]
        ]
    },
    {
        "bus_id": 2,
        "bus_number": "BUS-102",
        "plate_number": "MA-TR-4422",
        "vehicle_type": "Tourismo Express",
        "driver_name": "Samuel Tadesse",
        "driver_phone": "+251 922 345 678",
        "route_name": "Addis Ababa → Hawassa",
        "origin": "Addis Ababa",
        "destination": "Hawassa",
        "status": "In Transit",
        "current_location": {
            "lat": 8.0000,
            "lng": 38.8000,
            "address": "Expressway near Mojo"
        },
        "speed": 78,
        "heading": 170,
        "fuel_percent": 65,
        "passengers": 32,
        "capacity": 36,
        "eta": "1h 45m",
        "next_stop": "Batu (Ziway)",
        "route_coordinates": [
            [9.0100, 38.7600],
            [8.7500, 38.9800],
            [8.4500, 38.9900],
            [7.9300, 38.7100],
            [7.0600, 38.4800]
        ]
    },
    {
        "bus_id": 3,
        "bus_number": "BUS-103",
        "plate_number": "CA-TR-1290",
        "vehicle_type": "Scania Touring HD",
        "driver_name": "Mulugeta Haile",
        "driver_phone": "+251 933 456 789",
        "route_name": "Addis Ababa → Dire Dawa",
        "origin": "Addis Ababa",
        "destination": "Dire Dawa",
        "status": "In Transit",
        "current_location": {
            "lat": 8.9800,
            "lng": 40.0500,
            "address": "Awash National Park Bypass"
        },
        "speed": 62,
        "heading": 85,
        "fuel_percent": 55,
        "passengers": 41,
        "capacity": 44,
        "eta": "3h 10m",
        "next_stop": "Mieso Station",
        "route_coordinates": [
            [9.0100, 38.7600],
            [8.9800, 39.2200],
            [8.9800, 40.0500],
            [9.2300, 40.7500],
            [9.6000, 41.8600]
        ]
    },
    {
        "bus_id": 4,
        "bus_number": "BUS-104",
        "plate_number": "IL-TR-9031",
        "vehicle_type": "MCI J4500 Coach",
        "driver_name": "Dawit Tesfaye",
        "driver_phone": "+251 944 567 890",
        "route_name": "Addis Ababa → Jimma",
        "origin": "Addis Ababa",
        "destination": "Jimma",
        "status": "In Transit",
        "current_location": {
            "lat": 8.5400,
            "lng": 37.9700,
            "address": "Welkite Highway"
        },
        "speed": 55,
        "heading": 235,
        "fuel_percent": 72,
        "passengers": 35,
        "capacity": 40,
        "eta": "2h 30m",
        "next_stop": "Abelti River Crossing",
        "route_coordinates": [
            [9.0200, 38.7400],
            [8.7300, 38.3800],
            [8.5400, 37.9700],
            [8.0000, 37.4000],
            [7.6700, 36.8300]
        ]
    },
    {
        "bus_id": 5,
        "bus_number": "BUS-105",
        "plate_number": "WA-TR-3384",
        "vehicle_type": "Prevost H3-45",
        "driver_name": "Kassahun Girma",
        "driver_phone": "+251 955 678 901",
        "route_name": "Central Depot",
        "origin": "Addis Ababa Depot",
        "destination": "Addis Ababa Depot",
        "status": "Maintenance",
        "current_location": {
            "lat": 9.0050,
            "lng": 38.7850,
            "address": "Bole Maintenance Center"
        },
        "speed": 0,
        "heading": 0,
        "fuel_percent": 40,
        "passengers": 0,
        "capacity": 32,
        "eta": "Stationary",
        "next_stop": "Depot Bay 4",
        "route_coordinates": [
            [9.0050, 38.7850]
        ]
    },
    {
        "bus_id": 6,
        "bus_number": "BUS-106",
        "plate_number": "TX-TR-5519",
        "vehicle_type": "Setra ComfortClass",
        "driver_name": "Ermias Wolde",
        "driver_phone": "+251 966 789 012",
        "route_name": "Addis Ababa → Debre Mark'os",
        "origin": "Addis Ababa",
        "destination": "Debre Mark'os",
        "status": "Idling / Boarding",
        "current_location": {
            "lat": 9.0450,
            "lng": 38.7550,
            "address": "Autobis Tera Terminal"
        },
        "speed": 0,
        "heading": 15,
        "fuel_percent": 95,
        "passengers": 18,
        "capacity": 40,
        "eta": "Departs in 15m",
        "next_stop": "Sululta",
        "route_coordinates": [
            [9.0450, 38.7550],
            [9.5000, 38.6000],
            [10.3500, 37.7300]
        ]
    }
]

@tracking_bp.route('', methods=['GET'])
@auth_required
def get_all_locations():
    """Returns real-time locations and telemetry of all vehicles."""
    # Add slight realistic micro-variation for live tracking simulation
    t = time.time()
    fleet = []
    for v in VEHICLE_FLEET:
        item = dict(v)
        if item["status"] == "In Transit":
            # Small jitter to simulate live motion
            drift_lat = (random.random() - 0.5) * 0.0008
            drift_lng = (random.random() - 0.5) * 0.0008
            item["current_location"] = {
                "lat": item["current_location"]["lat"] + drift_lat,
                "lng": item["current_location"]["lng"] + drift_lng,
                "address": item["current_location"]["address"]
            }
            item["speed"] = max(20, min(95, item["speed"] + random.randint(-3, 3)))
        fleet.append(item)
    return json_response(True, "Live vehicle locations retrieved successfully.", {"vehicles": fleet, "timestamp": int(t)})

@tracking_bp.route('/<int:bus_id>', methods=['GET'])
@auth_required
def get_vehicle_location(bus_id):
    """Returns real-time location and telemetry for a specific vehicle."""
    vehicle = next((v for v in VEHICLE_FLEET if v["bus_id"] == bus_id), None)
    if not vehicle:
        return json_response(False, "Vehicle not found.", status_code=404)
    return json_response(True, "Vehicle location retrieved.", vehicle)
