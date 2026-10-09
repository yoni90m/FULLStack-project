import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_drivers(client):
    response = client.get('/api/drivers')
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert isinstance(json_data['data'], list)
    assert len(json_data['data']) > 0

def test_get_single_driver(client):
    response = client.get('/api/drivers/1')
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert json_data['data']['name'] == 'John Doe'

def test_create_driver_missing_fields(client):
    response = client.post('/api/drivers', json={"name": "No License"})
    json_data = response.get_json()
    assert response.status_code == 400
    assert json_data['success'] is False
