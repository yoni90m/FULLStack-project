from flask import Blueprint, request
from backend.models.passenger import Passenger
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required

passenger_bp = Blueprint('passenger_bp', __name__)

@passenger_bp.route('', methods=['GET'])
@auth_required
@role_required('Admin')
def get_passengers():
    bus_id = request.args.get('bus_id', type=int)
    passengers = Passenger.get_all(bus_id=bus_id)
    return json_response(True, "Booked passenger manifest retrieved successfully.", passengers)

@passenger_bp.route('/registered', methods=['GET'])
@auth_required
@role_required('Admin')
def get_registered_passengers():
    """Returns all registered passengers, regardless of booking status."""
    passengers = Passenger.get_all_registered()
    return json_response(True, "All registered passengers retrieved.", passengers)

@passenger_bp.route('/register', methods=['POST'])
@auth_required
@role_required('Admin')
def admin_register_passenger():
    """Admin-only: Register a new passenger with a user account."""
    from backend.services.auth_service import AuthService
    data = request.get_json() or {}
    success, message, result = AuthService.admin_register_passenger(data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result, status_code=201)

@passenger_bp.route('/<int:passenger_id>', methods=['GET'])
@auth_required
def get_passenger(passenger_id):
    p = Passenger.get_by_id(passenger_id)
    if not p:
        return json_response(False, "Passenger not found.", status_code=404)
    return json_response(True, "Passenger profile details", p)

@passenger_bp.route('/<int:passenger_id>', methods=['PUT'])
@auth_required
@role_required('Admin')
def update_passenger_status(passenger_id):
    p = Passenger.get_by_id(passenger_id)
    if not p:
        return json_response(False, "Passenger not found.", status_code=404)

    data = request.get_json() or {}
    status = data.get('status', p.get('status', 'Active'))
    Passenger.update_status(passenger_id, status)
    return json_response(True, f"Passenger account is now {status}.", {"passenger_id": passenger_id, "status": status})

@passenger_bp.route('/manifest/<int:schedule_id>', methods=['GET'])
@auth_required
@role_required('Admin', 'Driver')
def get_trip_manifest(schedule_id):
    """
    Returns the passenger manifest for a specific trip schedule.
    Accessible by Admin and Driver assigned to this trip.
    """
    manifest = Passenger.get_by_schedule_id(schedule_id)
    return json_response(True, "Trip passenger manifest retrieved.", manifest)

