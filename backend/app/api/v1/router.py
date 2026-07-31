from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.questions import router as questions_router
from app.api.v1.execution import router as execution_router

api_router = APIRouter()

# Include API routers
api_router.include_router(auth_router)
api_router.include_router(questions_router)

# Mount execution router under both /execution and root for endpoint flexibility
api_router.include_router(execution_router, prefix="/execution")
api_router.include_router(execution_router)

@api_router.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify backend service status."""
    return {"status": "healthy", "service": "DSA Practice Platform API", "version": "1.0.0"}
