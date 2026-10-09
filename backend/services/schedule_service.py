import datetime
from backend.models.schedule import Schedule
from backend.models.bus import Bus
from backend.models.route import Route
from backend.models.driver import Driver
from backend.utils.validators import validate_required_fields

class ScheduleService:
    @staticmethod
    def get_all_schedules():
        return Schedule.get_all()

    @staticmethod
    def get_schedule(schedule_id):
        s = Schedule.get_by_id(schedule_id)
        if not s:
            return False, "Schedule not found.", None
        return True, "", s

    @staticmethod
    def create_schedule(data):
        valid, err = validate_required_fields(data, ['bus_id', 'route_id', 'driver_id', 'departure_time', 'arrival_time'])
        if not valid:
            return False, err, None

        # Verify referenced entities exist
        bus = Bus.get_by_id(data['bus_id'])
        if not bus:
            return False, "Assigned bus does not exist.", None

        route = Route.get_by_id(data['route_id'])
        if not route:
            return False, "Assigned route does not exist.", None

        driver = Driver.get_by_id(data['driver_id'])
        if not driver:
            return False, "Assigned driver does not exist.", None

        # Check chronological order
        dept = str(data['departure_time']).replace('T', ' ')
        arr = str(data['arrival_time']).replace('T', ' ')
        if arr <= dept:
            return False, "Arrival time must be after departure time.", None

        # Check overlap conflicts
        has_conflict, conflict_msg = Schedule.check_conflicts(
            bus_id=int(data['bus_id']),
            driver_id=int(data['driver_id']),
            departure_time=dept,
            arrival_time=arr
        )
        if has_conflict:
            return False, conflict_msg, None

        fare = float(data.get('fare', route.get('fare', 25.00)))
        seats = int(bus.get('capacity', 40))

        schedule_id = Schedule.create(
            bus_id=int(data['bus_id']),
            route_id=int(data['route_id']),
            driver_id=int(data['driver_id']),
            departure_time=dept,
            arrival_time=arr,
            available_seats=seats,
            fare=fare,
            status=data.get('status', 'Scheduled')
        )
        return True, "Schedule created successfully.", {"schedule_id": schedule_id}

    @staticmethod
    def update_schedule(schedule_id, data):
        existing = Schedule.get_by_id(schedule_id)
        if not existing:
            return False, "Schedule not found.", None

        valid, err = validate_required_fields(data, ['bus_id', 'route_id', 'driver_id', 'departure_time', 'arrival_time'])
        if not valid:
            return False, err, None

        dept = str(data['departure_time']).replace('T', ' ')
        arr = str(data['arrival_time']).replace('T', ' ')
        if arr <= dept:
            return False, "Arrival time must be after departure time.", None

        has_conflict, conflict_msg = Schedule.check_conflicts(
            bus_id=int(data['bus_id']),
            driver_id=int(data['driver_id']),
            departure_time=dept,
            arrival_time=arr,
            exclude_schedule_id=schedule_id
        )
        if has_conflict:
            return False, conflict_msg, None

        fare = float(data.get('fare', existing.get('fare', 25.00)))

        Schedule.update(
            schedule_id=schedule_id,
            bus_id=int(data['bus_id']),
            route_id=int(data['route_id']),
            driver_id=int(data['driver_id']),
            departure_time=dept,
            arrival_time=arr,
            fare=fare,
            status=data.get('status', existing.get('status', 'Scheduled'))
        )
        return True, "Schedule updated successfully.", {"schedule_id": schedule_id}

    @staticmethod
    def delete_schedule(schedule_id):
        existing = Schedule.get_by_id(schedule_id)
        if not existing:
            return False, "Schedule not found."
        Schedule.delete(schedule_id)
        return True, "Schedule deleted successfully."
