import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.user import UserTokenPayload
from app.models.roadmap import (
    RoadmapGenerateRequest,
    RoadmapResponse,
    MilestoneToggleRequest
)
from app.services.roadmap_service import build_personalized_roadmap
from app.api.v1.resumes import _dev_resume_store

router = APIRouter(prefix="/roadmap", tags=["Skill Gap & Learning Roadmap"])

# In-memory storage for local dev / testing
_dev_roadmaps_store: Dict[str, Any] = {}

def extract_skills_from_builder_resume(resume_dict: Dict[str, Any]) -> List[str]:
    """Pull skills from resume builder record."""
    skills = []
    content = resume_dict.get("content", {})
    if content.get("skills"):
        for s in content["skills"]:
            if s.get("name"): skills.append(s["name"])
    return skills

@router.post("/generate", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
async def generate_roadmap(
    payload: RoadmapGenerateRequest,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Generate a personalized 30, 60, or 90-day learning roadmap tailored to the target role.
    """
    candidate_skills = []

    if payload.custom_skills:
        candidate_skills.extend(payload.custom_skills)

    if payload.resume_id:
        resume = _dev_resume_store.get(payload.resume_id)
        if resume and resume.get("user_id") == current_user.user_id:
            candidate_skills.extend(extract_skills_from_builder_resume(resume))

    # Deactivate previous roadmaps for this user
    for r in _dev_roadmaps_store.values():
        if r.get("user_id") == current_user.user_id:
            r["is_active"] = False

    roadmap_data = build_personalized_roadmap(
        target_role=payload.target_role,
        duration_days=payload.duration_days,
        candidate_skills=candidate_skills,
        job_description=payload.job_description
    )

    roadmap_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    roadmap_dict = roadmap_data.model_dump()
    roadmap_dict["id"] = roadmap_id
    roadmap_dict["user_id"] = current_user.user_id
    roadmap_dict["created_at"] = now
    roadmap_dict["updated_at"] = now

    _dev_roadmaps_store[roadmap_id] = roadmap_dict
    return RoadmapResponse(**roadmap_dict)

@router.get("/active", response_model=Optional[RoadmapResponse])
async def get_active_roadmap(current_user: UserTokenPayload = Depends(get_current_user)):
    """
    Fetch the candidate's active learning roadmap.
    """
    user_roadmaps = [
        r for r in _dev_roadmaps_store.values()
        if r.get("user_id") == current_user.user_id and r.get("is_active")
    ]
    if not user_roadmaps:
        return None
    user_roadmaps.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return RoadmapResponse(**user_roadmaps[0])

@router.get("", response_model=List[RoadmapResponse])
