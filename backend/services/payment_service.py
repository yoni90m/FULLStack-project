from backend.models.payment import Payment
from backend.models.booking import Booking
from backend.utils.validators import validate_required_fields

class PaymentService:
    @staticmethod
    def get_all_payments(current_user=None):
        if current_user and str(current_user.get('role', '')).strip().lower() == 'passenger':
            return Payment.get_all(user_id=current_user.get('user_id'))
        return Payment.get_all()

    @staticmethod
    def get_payment(payment_id):
        p = Payment.get_by_id(payment_id)
        if not p:
            return False, "Payment record not found.", None
        return True, "", p

    @staticmethod
    def create_payment(data):
        valid, err = validate_required_fields(data, ['booking_id', 'amount', 'payment_method'])
        if not valid:
            return False, err, None

        booking_id = int(data['booking_id'])
        booking = Booking.get_by_id(booking_id)
        if not booking:
            return False, "Referenced booking does not exist.", None

        payment_id, ref = Payment.create(
            booking_id=booking_id,
            amount=float(data['amount']),
            payment_method=data['payment_method'],
            payment_status=data.get('payment_status', 'Completed')
        )
        return True, "Payment recorded successfully.", {"payment_id": payment_id, "transaction_reference": ref}

    @staticmethod
    def update_payment(payment_id, data):
        existing = Payment.get_by_id(payment_id)
        if not existing:
            return False, "Payment not found.", None

        status = data.get('payment_status', existing['payment_status'])
        Payment.update_status(payment_id, status)
        return True, "Payment status updated.", {"payment_id": payment_id}
