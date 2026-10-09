from flask import Blueprint, request
from backend.services.bus_service import BusService
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required

bus_bp = Blueprint('bus_bp', __name__)

@bus_bp.route('', methods=['GET'])
@auth_required
def get_buses():
    buses = BusService.get_all_buses()
    return json_response(True, "Bus fleet retrieved successfully.", buses)

@bus_bp.route('/<int:bus_id>', methods=['GET'])
@auth_required
def get_bus(bus_id):
    success, message, bus = BusService.get_bus(bus_id)
    if not success:
        return json_response(False, message, status_code=404)
    return json_response(True, message, bus)

@bus_bp.route('', methods=['POST'])
@auth_required
@role_required('Admin')
def create_bus():
    data = request.get_json() or {}
    success, message, result = BusService.create_bus(data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result, status_code=201)

@bus_bp.route('/<int:bus_id>', methods=['PUT'])
@auth_required
@role_required('Admin')
def update_bus(bus_id):
    data = request.get_json() or {}
    success, message, result = BusService.update_bus(bus_id, data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result)

@bus_bp.route('/<int:bus_id>', methods=['DELETE'])
@auth_required
@role_required('Admin')
def delete_bus(bus_id):
    success, message = BusService.delete_bus(bus_id)
    if not success:
        return json_response(False, message, status_code=404)
    return json_response(True, message)
