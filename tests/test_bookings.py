import pytest
from backend.app import create_app
from backend.utils.security import generate_token

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_booking_invalid_seat_format(client):
    admin_token = generate_token({"user_id": 1, "username": "admin", "role": "Admin"})
    payload = {
        "schedule_id": 1,
        "passenger_id": 1,
        "seat_number": "INVALID_SEAT"
    }
    response = client.post(
        '/api/bookings',
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    json_data = response.get_json()
    assert response.status_code == 400
    assert json_data['success'] is False

def test_passenger_only_sees_own_bookings(client):
    # alice_smith has user_id: 5
    passenger_token = generate_token({"user_id": 5, "username": "alice_smith", "role": "Passenger"})
    response = client.get(
        '/api/bookings',
        headers={"Authorization": f"Bearer {passenger_token}"}
    )
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    # Verify every returned booking belongs to Alice (user_id 5)
    for booking in json_data['data']:
        assert booking['passenger_user_id'] == 5

def test_passenger_cannot_view_other_travellers_booking(client):
    # alice_smith has user_id: 5; booking_id 2 belongs to Bob (user_id 6)
    alice_token = generate_token({"user_id": 5, "username": "alice_smith", "role": "Passenger"})
    response = client.get(
        '/api/bookings/2',
        headers={"Authorization": f"Bearer {alice_token}"}
    )
    json_data = response.get_json()
    assert response.status_code == 403
    assert json_data['success'] is False
    assert "Access denied" in json_data['message']
