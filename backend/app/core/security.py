from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from app.core.config import settings

security = HTTPBearer()

class UserSession(BaseModel):
    user_id: str
    email: str
    role: str = "LEARNER"

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserSession:
    """
    Validates Supabase JWT token passed in Authorization Bearer header.
    Returns authenticated UserSession with user_id, email, and role.
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT token issued by Supabase Auth
        # Supabase JWT tokens are signed using the Supabase JWT secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_ANON_KEY,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id: Optional[str] = payload.get("sub")
        email: Optional[str] = payload.get("email", "")
        app_metadata = payload.get("app_metadata", {})
        user_metadata = payload.get("user_metadata", {})

        # Determine user role (defaults to LEARNER unless specified in app_metadata or DB profile)
        role = app_metadata.get("role") or user_metadata.get("role") or "LEARNER"

        if user_id is None:
            raise credentials_exception

        return UserSession(user_id=user_id, email=email, role=role)
    except JWTError:
        raise credentials_exception


async def require_admin(
    current_user: UserSession = Depends(get_current_user)
) -> UserSession:
    """
    Role-Based Access Control (RBAC) middleware dependency.
    Ensures that only users with the 'ADMIN' role can access admin endpoints.
    """
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to perform this action",
        )
    return current_user
