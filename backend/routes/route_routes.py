from flask import Blueprint, request
from backend.services.route_service import RouteService
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required

route_bp = Blueprint('route_bp', __name__)

@route_bp.route('', methods=['GET'])
@auth_required
def get_routes():
    routes = RouteService.get_all_routes()
    return json_response(True, "Routes retrieved successfully.", routes)

@route_bp.route('/<int:route_id>', methods=['GET'])
@auth_required
def get_route(route_id):
    success, message, route = RouteService.get_route(route_id)
    if not success:
        return json_response(False, message, status_code=404)
    return json_response(True, message, route)

@route_bp.route('', methods=['POST'])
@auth_required
@role_required('Admin')
def create_route():
    data = request.get_json() or {}
    success, message, result = RouteService.create_route(data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result, status_code=201)

@route_bp.route('/<int:route_id>', methods=['PUT'])
@auth_required
@role_required('Admin')
def update_route(route_id):
    data = request.get_json() or {}
    success, message, result = RouteService.update_route(route_id, data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result)

@route_bp.route('/<int:route_id>', methods=['DELETE'])
@auth_required
@role_required('Admin')
def delete_route(route_id):
    success, message = RouteService.delete_route(route_id)
    if not success:
        return json_response(False, message, status_code=404)
    return json_response(True, message)
