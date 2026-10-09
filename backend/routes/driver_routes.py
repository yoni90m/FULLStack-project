from flask import Blueprint, request
from backend.models.driver import Driver
from backend.utils.helpers import json_response
from backend.utils.validators import validate_required_fields
from backend.utils.security import auth_required, role_required

driver_bp = Blueprint('driver_bp', __name__)

@driver_bp.route('', methods=['GET'])
@auth_required
def get_drivers():
    drivers = Driver.get_all()
    return json_response(True, "Drivers retrieved successfully.", drivers)

@driver_bp.route('/<int:driver_id>', methods=['GET'])
@auth_required
def get_driver(driver_id):
    driver = Driver.get_by_id(driver_id)
    if not driver:
        return json_response(False, "Driver not found.", status_code=404)
    return json_response(True, "Driver details", driver)

@driver_bp.route('', methods=['POST'])
@auth_required
@role_required('Admin')
def create_driver():
    data = request.get_json() or {}
    valid, err = validate_required_fields(data, ['name', 'phone', 'license_number'])
    if not valid:
        return json_response(False, err, status_code=400)

    # Check unique license
    existing = Driver.get_by_license(data['license_number'])
    if existing:
        return json_response(False, "License number is already registered.", status_code=400)

    driver_id = Driver.create(
        name=data['name'].strip(),
        phone=data['phone'].strip(),
        license_number=data['license_number'].strip().upper(),
        user_id=data.get('user_id'),
        status=data.get('status', 'Active')
    )
    return json_response(True, "Driver created successfully.", {"driver_id": driver_id}, status_code=201)

@driver_bp.route('/<int:driver_id>', methods=['PUT'])
@auth_required
@role_required('Admin')
def update_driver(driver_id):
    driver = Driver.get_by_id(driver_id)
    if not driver:
        return json_response(False, "Driver not found.", status_code=404)

    data = request.get_json() or {}
    valid, err = validate_required_fields(data, ['name', 'phone', 'license_number'])
    if not valid:
        return json_response(False, err, status_code=400)

    duplicate = Driver.get_by_license(data['license_number'], exclude_id=driver_id)
    if duplicate:
        return json_response(False, "License number is already assigned to another driver.", status_code=400)

    Driver.update(
        driver_id=driver_id,
        name=data['name'].strip(),
        phone=data['phone'].strip(),
        license_number=data['license_number'].strip().upper(),
        status=data.get('status', driver.get('status', 'Active'))
    )
    return json_response(True, "Driver updated successfully.", {"driver_id": driver_id})

@driver_bp.route('/<int:driver_id>', methods=['DELETE'])
@auth_required
@role_required('Admin')
def delete_driver(driver_id):
    driver = Driver.get_by_id(driver_id)
    if not driver:
        return json_response(False, "Driver not found.", status_code=404)
    Driver.delete(driver_id)
    return json_response(True, "Driver deleted successfully.")
