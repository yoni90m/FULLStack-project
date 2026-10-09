from backend.models.booking import Booking
from backend.models.schedule import Schedule
from backend.models.passenger import Passenger
from backend.models.payment import Payment
from backend.utils.validators import validate_required_fields, validate_seat_number

class BookingService:
    @staticmethod
    def get_all_bookings(current_user=None):
        if current_user and str(current_user.get('role', '')).strip().lower() == 'passenger':
            return Booking.get_all(user_id=current_user.get('user_id'))
        return Booking.get_all()

    @staticmethod
    def get_booking(booking_id):
        b = Booking.get_by_id(booking_id)
        if not b:
            return False, "Booking not found.", None
        return True, "", b

    @staticmethod
    def create_booking(data, current_user=None):
        valid, err = validate_required_fields(data, ['schedule_id', 'seat_number'])
        if not valid:
            return False, err, None

        seat_num = str(data['seat_number']).strip().upper()
        valid_seat, seat_err = validate_seat_number(seat_num)
        if not valid_seat:
            return False, seat_err, None

        schedule_id = int(data['schedule_id'])

        # Determine passenger_id
        passenger_id = data.get('passenger_id')
        if not passenger_id and current_user and current_user.get('user_id'):
            p_rec = Passenger.get_by_user_id(current_user['user_id'])
            if p_rec:
                passenger_id = p_rec['passenger_id']
            else:
                passenger_id = Passenger.create(
                    name=current_user.get('name') or current_user.get('username') or 'Passenger',
                    phone='N/A',
                    email=current_user.get('email', 'passenger@translink.com'),
                    user_id=current_user['user_id']
                )

        if not passenger_id:
            return False, "Passenger ID is required to reserve a booking.", None

        passenger_id = int(passenger_id)

        # 1. Check schedule exists
        schedule = Schedule.get_by_id(schedule_id)
        if not schedule:
            return False, "Selected schedule does not exist.", None

        # 2. Check schedule is active
        if schedule['status'] in ['Cancelled', 'Completed']:
            return False, f"Cannot book tickets for this trip because it is {schedule['status'].lower()}.", None

        # 3. Check seat availability count
        if schedule['available_seats'] <= 0:
            return False, "This bus has no remaining available seats.", None

        # 4. Check that specific seat is not already booked
        if Booking.is_seat_booked(schedule_id, seat_num):
            return False, f"Seat {seat_num} is already booked for this schedule.", None

        # 5. Check passenger exists
        passenger = Passenger.get_by_id(passenger_id)
        if not passenger:
            return False, "Passenger record not found.", None

        # 6. Create booking
        booking_id, ref = Booking.create(
            passenger_id=passenger_id,
            schedule_id=schedule_id,
            seat_number=seat_num,
            status=data.get('booking_status', 'Confirmed')
        )

        # 7. Reduce available seats in schedule
        Schedule.decrement_seats(schedule_id)

        # 8. Record payment transaction
        payment_method = data.get('payment_method', 'Credit Card')
        fare_amount = float(schedule.get('fare', 25.00))
        payment_id, txn_ref = Payment.create(
            booking_id=booking_id,
            amount=fare_amount,
            payment_method=payment_method,
            payment_status='Completed'
        )

        result_data = {
            "booking_id": booking_id,
            "booking_reference": ref,
            "seat_number": seat_num,
            "payment_id": payment_id,
            "transaction_reference": txn_ref,
            "amount": fare_amount
        }
        return True, "Booking reserved and confirmed successfully.", result_data

    @staticmethod
    def update_booking(booking_id, data):
        existing = Booking.get_by_id(booking_id)
        if not existing:
            return False, "Booking not found.", None

        status = data.get('booking_status', existing['booking_status'])
        Booking.update_status(booking_id, status)
        return True, "Booking status updated.", {"booking_id": booking_id, "status": status}

    @staticmethod
    def cancel_booking(booking_id):
        booking = Booking.get_by_id(booking_id)
        if not booking:
            return False, "Booking not found."

        if booking['booking_status'] == 'Cancelled':
            return False, "Booking is already cancelled."

        Booking.update_status(booking_id, 'Cancelled')

        # Release seat back to schedule
        Schedule.increment_seats(booking['schedule_id'])
        return True, "Booking cancelled successfully and seat has been released."
