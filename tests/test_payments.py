import pytest
from backend.app import create_app
from backend.utils.security import generate_token

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_payments(client):
    admin_token = generate_token({"user_id": 1, "username": "admin", "role": "Admin"})
    response = client.get('/api/payments', headers={"Authorization": f"Bearer {admin_token}"})
    json_data = response.get_json()
    assert response.status_code == 200
    assert 'success' in json_data

def test_create_telebirr_payment(client):
    admin_token = generate_token({"user_id": 1, "username": "admin", "role": "Admin"})
    payload = {
        "booking_id": 1,
        "amount": 650.00,
        "payment_method": "Telebirr",
        "phone_number": "0911234567"
    }
    response = client.post(
        '/api/payments',
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    json_data = response.get_json()
    assert response.status_code == 201
    assert json_data['success'] is True
    assert json_data['data']['payment_method'] == 'Telebirr'
    assert json_data['data']['transaction_reference'].startswith('TXN-TB-')
    assert json_data['data']['currency'] == 'ETB'

def test_create_mobile_banking_payment(client):
    admin_token = generate_token({"user_id": 1, "username": "admin", "role": "Admin"})
    payload = {
        "booking_id": 2,
        "amount": 320.00,
        "payment_method": "Mobile Banking",
        "bank_name": "Commercial Bank of Ethiopia (CBE Birr)"
    }
    response = client.post(
        '/api/payments',
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    json_data = response.get_json()
    assert response.status_code == 201
    assert json_data['success'] is True
    assert json_data['data']['payment_method'] == 'Mobile Banking'
    assert json_data['data']['transaction_reference'].startswith('TXN-MB-')

def test_create_cash_payment(client):
    admin_token = generate_token({"user_id": 1, "username": "admin", "role": "Admin"})
    payload = {
        "booking_id": 3,
        "amount": 550.00,
        "payment_method": "Cash"
    }
    response = client.post(
        '/api/payments',
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    json_data = response.get_json()
    assert response.status_code == 201
    assert json_data['success'] is True
    assert json_data['data']['payment_method'] == 'Cash'
    assert json_data['data']['transaction_reference'].startswith('TXN-CS-')

def test_invalid_telebirr_phone(client):
    admin_token = generate_token({"user_id": 1, "username": "admin", "role": "Admin"})
    payload = {
        "booking_id": 1,
        "amount": 650.00,
        "payment_method": "Telebirr",
        "phone_number": "12345"
    }
    response = client.post(
        '/api/payments',
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    json_data = response.get_json()
    assert response.status_code == 400
    assert json_data['success'] is False
    assert "Invalid Ethiopian phone number" in json_data['message']
