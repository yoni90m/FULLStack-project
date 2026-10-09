from flask import Blueprint, request
from backend.services.schedule_service import ScheduleService
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required

schedule_bp = Blueprint('schedule_bp', __name__)

@schedule_bp.route('', methods=['GET'])
@auth_required
def get_schedules():
    schedules = ScheduleService.get_all_schedules()
    return json_response(True, "Schedules retrieved successfully.", schedules)

@schedule_bp.route('/<int:schedule_id>', methods=['GET'])
@auth_required
def get_schedule(schedule_id):
    success, message, sched = ScheduleService.get_schedule(schedule_id)
    if not success:
        return json_response(False, message, status_code=404)
    return json_response(True, message, sched)

@schedule_bp.route('', methods=['POST'])
@auth_required
@role_required('Admin')
def create_schedule():
    data = request.get_json() or {}
    success, message, result = ScheduleService.create_schedule(data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result, status_code=201)

@schedule_bp.route('/<int:schedule_id>', methods=['PUT'])
@auth_required
@role_required('Admin')
def update_schedule(schedule_id):
    data = request.get_json() or {}
    success, message, result = ScheduleService.update_schedule(schedule_id, data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result)

@schedule_bp.route('/<int:schedule_id>', methods=['DELETE'])
@auth_required
@role_required('Admin')
def delete_schedule(schedule_id):
    success, message = ScheduleService.delete_schedule(schedule_id)
    if not success:
        return json_response(False, message, status_code=404)
    return json_response(True, message)
