import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_schedules(client):
    response = client.get('/api/schedules')
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert isinstance(json_data['data'], list)
    assert len(json_data['data']) > 0

def test_get_single_schedule(client):
    response = client.get('/api/schedules/1')
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert 'route_name' in json_data['data']

def test_schedule_missing_fields(client):
    response = client.post('/api/schedules', json={"bus_id": 1})
    json_data = response.get_json()
    assert response.status_code == 400
    assert json_data['success'] is False
