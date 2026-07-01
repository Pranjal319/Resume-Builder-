from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify backend service status.
    Returns status confirmation, service name, UTC timestamp, and version.
    """
    return {
        "status": "healthy",
        "service": "CareerAI Backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }
