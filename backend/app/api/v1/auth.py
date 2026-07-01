from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import UserTokenPayload

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/status")
async def auth_status():
    """
    Returns public authentication configuration readiness status.
    """
    return {
        "supabase_configured": bool(settings.SUPABASE_JWT_SECRET),
        "auth_provider": "Supabase PostgreSQL",
        "token_algorithm": "HS256"
    }

@router.get("/me")
async def get_my_profile(current_user: UserTokenPayload = Depends(get_current_user)):
    """
    Protected endpoint: returns the authenticated user's token claims.
    Verifies that the Supabase JWT is valid and unexpired.
    """
    return {
        "authenticated": True,
        "user_id": current_user.user_id,
        "email": current_user.email,
        "role": current_user.role,
        "message": "Authenticated successfully with verified Supabase JWT."
    }
