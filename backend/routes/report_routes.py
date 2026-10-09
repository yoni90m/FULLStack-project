from flask import Blueprint
from backend.models.bus import Bus
from backend.models.driver import Driver
from backend.models.route import Route
from backend.models.passenger import Passenger
from backend.models.booking import Booking
from backend.models.payment import Payment
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/stats', methods=['GET'])
@auth_required
@role_required('Admin')
def get_dashboard_stats():
    buses = Bus.get_all()
    drivers = Driver.get_all()
    routes = Route.get_all()
    passengers = Passenger.get_all()
    bookings = Booking.get_all()
    payments = Payment.get_all()

    total_revenue = sum(
        float(p['amount']) for p in payments 
        if p.get('payment_status') == 'Completed' and p.get('amount')
    )

    data = {
        "total_buses": len(buses),
        "total_drivers": len(drivers),
        "total_routes": len(routes),
        "total_passengers": len(passengers),
        "total_bookings": len(bookings),
        "total_revenue": f"{total_revenue:.2f}",
        "active_buses": len([b for b in buses if b.get('status') in ['Available', 'Assigned']])
    }
    return json_response(True, "Executive dashboard metrics calculated.", data)
