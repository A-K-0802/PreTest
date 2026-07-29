from fastapi import APIRouter, Depends
from app.core.security import get_current_user, UserSession

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me")
async def get_my_profile(current_user: UserSession = Depends(get_current_user)):
    """
    Returns authenticated user session details (user ID, email, verified role).
    """
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "role": current_user.role,
        "is_admin": current_user.role.upper() == "ADMIN",
    }
