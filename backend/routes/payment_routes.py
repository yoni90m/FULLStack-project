from flask import Blueprint, request, g
from backend.services.payment_service import PaymentService
from backend.models.booking import Booking
from backend.models.passenger import Passenger
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required

payment_bp = Blueprint('payment_bp', __name__)

@payment_bp.route('', methods=['GET'])
@auth_required
def get_payments():
    payments = PaymentService.get_all_payments(current_user=g.current_user)
    return json_response(True, "Payments ledger retrieved.", payments)

@payment_bp.route('/<int:payment_id>', methods=['GET'])
@auth_required
def get_payment(payment_id):
    success, message, payment = PaymentService.get_payment(payment_id)
    if not success:
        return json_response(False, message, status_code=404)

    # Enforce passenger privacy
    if str(g.current_user.get('role', '')).strip().lower() == 'passenger':
        booking = Booking.get_by_id(payment.get('booking_id'))
        if booking:
            pass_user = Passenger.get_by_id(booking.get('passenger_id'))
            if not pass_user or pass_user.get('user_id') != g.current_user.get('user_id'):
                return json_response(False, "Access denied. You can only view your own payments.", status_code=403)

    return json_response(True, message, payment)

@payment_bp.route('', methods=['POST'])
@auth_required
def create_payment():
    data = request.get_json() or {}
    success, message, result = PaymentService.create_payment(data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result, status_code=201)

@payment_bp.route('/<int:payment_id>', methods=['PUT'])
@auth_required
@role_required('Admin')
def update_payment(payment_id):
    data = request.get_json() or {}
    success, message, result = PaymentService.update_payment(payment_id, data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result)
