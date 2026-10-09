import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_create_route_identical_cities(client):
    payload = {
        "origin": "Addis Ababa",
        "destination": "Addis Ababa",
        "distance": 100,
        "estimated_duration": "2h"
    }
    response = client.post('/api/routes', json=payload)
    json_data = response.get_json()
    assert response.status_code == 400
    assert json_data['success'] is False
