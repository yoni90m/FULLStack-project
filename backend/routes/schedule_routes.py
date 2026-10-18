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

@schedule_bp.route('/<int:schedule_id>/status', methods=['PUT'])
@auth_required
@role_required('Admin', 'Driver')
def update_trip_status(schedule_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        return json_response(False, "Status is required.", status_code=400)
        
    allowed_statuses = ['Scheduled', 'Boarding', 'In Transit', 'Completed', 'Cancelled']
    if new_status not in allowed_statuses:
        return json_response(False, f"Invalid status. Must be one of: {', '.join(allowed_statuses)}", status_code=400)
        
    from backend.models.schedule import Schedule
    sched = Schedule.get_by_id(schedule_id)
    if not sched:
        return json_response(False, "Trip schedule not found.", status_code=404)
        
    Schedule.update_status(schedule_id, new_status)
    return json_response(True, f"Trip status updated to {new_status}.", {"schedule_id": schedule_id, "status": new_status})

@schedule_bp.route('/driver/my-trips', methods=['GET'])
@auth_required
@role_required('Driver', 'Admin')
def get_driver_trips():
    from flask import g
    from backend.models.driver import Driver
    from backend.models.schedule import Schedule
    
    current_user_id = g.current_user.get("user_id")
    # Find matching driver profile
    all_drivers = Driver.get_all()
    driver = next((d for d in all_drivers if d.get("user_id") == current_user_id or d.get("name", "").lower() == g.current_user.get("username", "").lower()), None)
    
    if driver:
        trips = Schedule.get_by_driver(driver["driver_id"])
    else:
        # If admin or unlinked driver, return all active schedules
        trips = Schedule.get_all()
        
    return json_response(True, "Driver trips retrieved successfully.", trips)
