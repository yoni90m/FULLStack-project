import pytest
from flask.testing import FlaskClient
from backend.utils.security import generate_token

@pytest.fixture(autouse=True)
def inject_auth(monkeypatch):
    orig_open = FlaskClient.open
    def auth_open(self, *args, **kwargs):
        headers = kwargs.get('headers')
        if headers is None:
            kwargs['headers'] = {}
            headers = kwargs['headers']
        if isinstance(headers, dict) and 'Authorization' not in headers:
            token = generate_token({"user_id": 1, "username": "admin", "email": "admin@translink.com", "role": "Admin"})
            headers['Authorization'] = f"Bearer {token}"
        return orig_open(self, *args, **kwargs)
    monkeypatch.setattr(FlaskClient, "open", auth_open)
