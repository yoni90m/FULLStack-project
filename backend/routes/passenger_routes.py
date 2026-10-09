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
