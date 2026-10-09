import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_login_missing_fields(client):
    response = client.post('/api/auth/login', json={})
    json_data = response.get_json()
    assert response.status_code == 401 or response.status_code == 400
    assert json_data['success'] is False

def test_register_validation(client):
    response = client.post('/api/auth/register', json={"username": "testuser"})
    json_data = response.get_json()
    assert response.status_code == 400
    assert json_data['success'] is False
