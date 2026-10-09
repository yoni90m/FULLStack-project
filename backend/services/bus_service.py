from backend.models.bus import Bus
from backend.utils.validators import validate_required_fields, validate_bus_capacity

class BusService:
    @staticmethod
    def get_all_buses():
        return Bus.get_all()

    @staticmethod
    def get_bus(bus_id):
        bus = Bus.get_by_id(bus_id)
        if not bus:
            return False, "Bus not found.", None
        return True, "", bus

    @staticmethod
    def create_bus(data):
        valid, err = validate_required_fields(data, ['bus_number', 'plate_number', 'model', 'capacity'])
        if not valid:
            return False, err, None

        valid_cap, cap_err = validate_bus_capacity(data['capacity'])
        if not valid_cap:
            return False, cap_err, None

        # Check unique plate and bus number
        existing = Bus.get_by_plate_or_number(data['plate_number'], data['bus_number'])
        if existing:
            return False, "Bus number or license plate number is already registered.", None

        bus_id = Bus.create(
            bus_number=data['bus_number'].strip().upper(),
            plate_number=data['plate_number'].strip().upper(),
            model=data['model'].strip(),
            capacity=int(data['capacity']),
            status=data.get('status', 'Available')
        )
        return True, "Bus created successfully.", {"bus_id": bus_id}

    @staticmethod
    def update_bus(bus_id, data):
        existing_bus = Bus.get_by_id(bus_id)
        if not existing_bus:
            return False, "Bus not found.", None

        valid, err = validate_required_fields(data, ['bus_number', 'plate_number', 'model', 'capacity'])
        if not valid:
            return False, err, None

        valid_cap, cap_err = validate_bus_capacity(data['capacity'])
        if not valid_cap:
            return False, cap_err, None

        # Check unique conflict excluding current bus
        duplicate = Bus.get_by_plate_or_number(data['plate_number'], data['bus_number'], exclude_id=bus_id)
        if duplicate:
            return False, "Another bus already has this bus number or plate number.", None

        Bus.update(
            bus_id=bus_id,
            bus_number=data['bus_number'].strip().upper(),
            plate_number=data['plate_number'].strip().upper(),
            model=data['model'].strip(),
            capacity=int(data['capacity']),
            status=data.get('status', existing_bus['status'])
        )
        return True, "Bus updated successfully.", {"bus_id": bus_id}

    @staticmethod
    def delete_bus(bus_id):
        existing = Bus.get_by_id(bus_id)
        if not existing:
            return False, "Bus not found."
        Bus.delete(bus_id)
        return True, "Bus deleted successfully."
