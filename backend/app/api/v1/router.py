from fastapi import APIRouter

api_router = APIRouter()

@api_router.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify backend service status."""
    return {"status": "healthy", "service": "DSA Practice Platform API", "version": "1.0.0"}
