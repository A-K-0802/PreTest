from fastapi import APIRouter
from app.api.v1.auth import router as auth_router

api_router = APIRouter()

# Include auth routes
api_router.include_router(auth_router)

@api_router.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify backend service status."""
    return {"status": "healthy", "service": "DSA Practice Platform API", "version": "1.0.0"}
