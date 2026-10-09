from flask import Blueprint, request, g
from backend.services.booking_service import BookingService
from backend.models.booking import Booking
from backend.models.passenger import Passenger
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required

booking_bp = Blueprint('booking_bp', __name__)

@booking_bp.route('', methods=['GET'])
@auth_required
def get_bookings():
    bookings = BookingService.get_all_bookings(current_user=g.current_user)
    return json_response(True, "Bookings retrieved successfully.", bookings)

@booking_bp.route('/<int:booking_id>', methods=['GET'])
@auth_required
def get_booking(booking_id):
    success, message, booking = BookingService.get_booking(booking_id)
    if not success:
        return json_response(False, message, status_code=404)

    # Enforce passenger privacy
    if str(g.current_user.get('role', '')).strip().lower() == 'passenger':
        pass_user = Passenger.get_by_id(booking.get('passenger_id'))
        if not pass_user or pass_user.get('user_id') != g.current_user.get('user_id'):
            return json_response(False, "Access denied. You can only view your own bookings.", status_code=403)

    return json_response(True, message, booking)

@booking_bp.route('', methods=['POST'])
@auth_required
def create_booking():
    data = request.get_json() or {}
    success, message, result = BookingService.create_booking(data, current_user=g.current_user)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result, status_code=201)

@booking_bp.route('/<int:booking_id>', methods=['PUT'])
@auth_required
@role_required('Admin')
def update_booking(booking_id):
    data = request.get_json() or {}
    success, message, result = BookingService.update_booking(booking_id, data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result)

@booking_bp.route('/<int:booking_id>', methods=['DELETE'])
@auth_required
def cancel_booking(booking_id):
    # If passenger, verify this booking belongs to them
    if str(g.current_user.get('role', '')).strip().lower() == 'passenger':
        booking = Booking.get_by_id(booking_id)
        if not booking:
            return json_response(False, "Booking not found.", status_code=404)
        pass_user = Passenger.get_by_id(booking.get('passenger_id'))
        if not pass_user or pass_user.get('user_id') != g.current_user.get('user_id'):
            return json_response(False, "Access denied. You can only cancel your own bookings.", status_code=403)

    success, message = BookingService.cancel_booking(booking_id)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message)
