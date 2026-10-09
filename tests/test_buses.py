import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_buses(client):
    response = client.get('/api/buses')
    json_data = response.get_json()
    assert response.status_code == 200
    assert 'success' in json_data

def test_create_bus_invalid_capacity(client):
    payload = {
        "bus_number": "TEST-100",
        "plate_number": "TEST-9999",
        "model": "Volvo",
        "capacity": -10
    }
    response = client.post('/api/buses', json=payload)
    json_data = response.get_json()
    assert response.status_code == 400
    assert json_data['success'] is False
