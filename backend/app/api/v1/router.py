from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.matcher import router as matcher_router
from app.api.v1.roadmap import router as roadmap_router
from app.api.v1.dashboard import router as dashboard_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(resumes_router)
api_router.include_router(analysis_router)
api_router.include_router(matcher_router)
api_router.include_router(roadmap_router)
api_router.include_router(dashboard_router)
