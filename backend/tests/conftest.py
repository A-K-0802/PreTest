import pytest
from fastapi.testclient import TestClient
from jose import jwt
from app.main import app

@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)

@pytest.fixture
def learner_token():
    """Generate valid JWT token for a LEARNER user."""
    payload = {
        "sub": "11111111-1111-1111-1111-111111111111",
        "email": "learner@testprep.com",
        "app_metadata": {"role": "LEARNER"}
    }
    return jwt.encode(payload, "secret", algorithm="HS256")

@pytest.fixture
def admin_token():
    """Generate valid JWT token for an ADMIN user."""
    payload = {
        "sub": "22222222-2222-2222-2222-222222222222",
        "email": "admin@testprep.com",
        "app_metadata": {"role": "ADMIN"}
    }
    return jwt.encode(payload, "secret", algorithm="HS256")
