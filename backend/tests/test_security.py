import asyncio
import pytest
from app.core.security import get_current_user, require_admin, UserSession

def test_security_valid_jwt_parsing(learner_token):
    """Test get_current_user correctly parses valid JWT claims."""
    class FakeCreds:
        credentials = learner_token

    user = asyncio.run(get_current_user(FakeCreds()))
    assert user.user_id == "11111111-1111-1111-1111-111111111111"
    assert user.email == "learner@testprep.com"
    assert user.role == "LEARNER"

def test_security_admin_role(admin_token):
    """Test require_admin passes for ADMIN user."""
    class FakeCreds:
        credentials = admin_token

    user = asyncio.run(get_current_user(FakeCreds()))
    admin_user = asyncio.run(require_admin(user))
    assert admin_user.role == "ADMIN"

def test_security_invalid_jwt_throws_401():
    """Test invalid JWT token raises 401 Unauthorized."""
    class FakeCreds:
        credentials = "invalid.malformed.token"

    with pytest.raises(Exception) as exc_info:
        asyncio.run(get_current_user(FakeCreds()))
    assert "401" in str(exc_info.value)
