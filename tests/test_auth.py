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

def test_admin_get_users(client):
    response = client.get('/api/auth/users')
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert isinstance(json_data['data'], list)
    assert len(json_data['data']) > 0

def test_admin_reset_password_success(client):
    # Reset password for alice_smith (user_id=5)
    response = client.post('/api/auth/admin/reset-password', json={
        "user_id": 5,
        "new_password": "NewSecretPass123"
    })
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert json_data['data']['new_password'] == "NewSecretPass123"

    # Now verify Alice can login with the new password
    login_res = client.post('/api/auth/login', json={
        "username": "alice_smith",
        "password": "NewSecretPass123"
    })
    login_data = login_res.get_json()
    assert login_res.status_code == 200
    assert login_data['success'] is True

def test_admin_reset_password_auto_generate(client):
    # Reset password with auto-generated password for bob_jones (user_id=6)
    response = client.post('/api/auth/admin/reset-password', json={
        "identifier": "bob_jones"
    })
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    generated_pw = json_data['data']['new_password']
    assert generated_pw.startswith("TransLink#")

    # Verify bob can login with the generated password
    login_res = client.post('/api/auth/login', json={
        "username": "bob_jones",
        "password": generated_pw
    })
    login_data = login_res.get_json()
    assert login_res.status_code == 200
    assert login_data['success'] is True

def test_admin_reset_password_user_not_found(client):
    response = client.post('/api/auth/admin/reset-password', json={
        "user_id": 999999
    })
    json_data = response.get_json()
    assert response.status_code == 404
    assert json_data['success'] is False

def test_admin_reset_password_short_password(client):
    response = client.post('/api/auth/admin/reset-password', json={
        "user_id": 1,
        "new_password": "123"
    })
    json_data = response.get_json()
    assert response.status_code == 400
    assert json_data['success'] is False

