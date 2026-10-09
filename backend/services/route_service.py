from backend.models.route import Route
from backend.utils.validators import validate_required_fields, validate_route

class RouteService:
    @staticmethod
    def get_all_routes():
        return Route.get_all()

    @staticmethod
    def get_route(route_id):
        r = Route.get_by_id(route_id)
        if not r:
            return False, "Route not found.", None
        return True, "", r

    @staticmethod
    def create_route(data):
        valid, err = validate_required_fields(data, ['origin', 'destination', 'distance', 'estimated_duration'])
        if not valid:
            return False, err, None

        valid_r, r_err = validate_route(data['origin'], data['destination'], data['distance'])
        if not valid_r:
            return False, r_err, None

        route_id = Route.create(
            origin=data['origin'].strip(),
            destination=data['destination'].strip(),
            distance=float(data['distance']),
            estimated_duration=data['estimated_duration'].strip(),
            fare=float(data.get('fare', 25.00)),
            status=data.get('status', 'Active')
        )
        return True, "Route created successfully.", {"route_id": route_id}

    @staticmethod
    def update_route(route_id, data):
        existing = Route.get_by_id(route_id)
        if not existing:
            return False, "Route not found.", None

        valid, err = validate_required_fields(data, ['origin', 'destination', 'distance', 'estimated_duration'])
        if not valid:
            return False, err, None

        valid_r, r_err = validate_route(data['origin'], data['destination'], data['distance'])
        if not valid_r:
            return False, r_err, None

        Route.update(
            route_id=route_id,
            origin=data['origin'].strip(),
            destination=data['destination'].strip(),
            distance=float(data['distance']),
            estimated_duration=data['estimated_duration'].strip(),
            fare=float(data.get('fare', existing.get('fare', 25.00))),
            status=data.get('status', existing.get('status', 'Active'))
        )
        return True, "Route updated successfully.", {"route_id": route_id}

    @staticmethod
    def delete_route(route_id):
        existing = Route.get_by_id(route_id)
        if not existing:
            return False, "Route not found."
        Route.delete(route_id)
        return True, "Route deleted successfully."
