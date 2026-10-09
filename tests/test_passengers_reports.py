import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_passengers(client):
    response = client.get('/api/passengers')
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert isinstance(json_data['data'], list)
    assert len(json_data['data']) > 0

def test_get_single_passenger(client):
    response = client.get('/api/passengers/1')
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert json_data['data']['email'] == 'alice.smith@gmail.com'

def test_get_reports_stats(client):
    response = client.get('/api/reports/stats')
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    data = json_data['data']
    assert 'total_buses' in data
    assert 'total_drivers' in data
    assert 'total_routes' in data
    assert 'total_revenue' in data
