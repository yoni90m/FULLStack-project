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

        method = str(data['payment_method']).strip()
        phone_number = str(data.get('phone_number', '')).strip()
        bank_name = str(data.get('bank_name', '')).strip()

        # Telebirr validation & metadata simulation
        if method.lower() == 'telebirr':
            if phone_number and not (phone_number.startswith('09') or phone_number.startswith('+2519') or phone_number.startswith('2519') or phone_number.startswith('07') or phone_number.startswith('+2517')):
                return False, "Invalid Ethiopian phone number for Telebirr. Must start with 09 or 07 (e.g., 0911234567).", None

        # Determine default status based on payment channel
        payment_status = data.get('payment_status')
        if not payment_status:
            if method.lower() in ['telebirr', 'mobile banking', 'cbe birr']:
                payment_status = 'Completed'
            elif method.lower() == 'cash':
                payment_status = 'Completed'
            else:
                payment_status = 'Completed'

        payment_id, ref = Payment.create(
            booking_id=booking_id,
            amount=float(data['amount']),
            payment_method=method,
            payment_status=payment_status
        )

        res_payload = {
            "payment_id": payment_id,
            "transaction_reference": ref,
            "payment_method": method,
            "payment_status": payment_status,
            "amount": float(data['amount']),
            "currency": "ETB"
        }
        if phone_number:
            res_payload["phone_number"] = phone_number
        if bank_name:
            res_payload["bank_name"] = bank_name

        message = f"Payment of ETB {float(data['amount']):.2f} via {method} processed successfully."
        return True, message, res_payload

    @staticmethod
    def update_payment(payment_id, data):
        existing = Payment.get_by_id(payment_id)
        if not existing:
            return False, "Payment not found.", None

        status = data.get('payment_status', existing['payment_status'])
        Payment.update_status(payment_id, status)
        return True, "Payment status updated.", {"payment_id": payment_id}
