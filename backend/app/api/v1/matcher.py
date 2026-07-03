import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.user import UserTokenPayload
from app.models.job_matcher import (
    JobDescriptionCreate,
    JobDescriptionResponse,
    JobMatchRequest,
    JobMatchResponse
)
from app.services.matcher_service import match_resume_to_job, extract_skills_from_text
from app.api.v1.resumes import _dev_resume_store
from app.api.v1.analysis import resume_content_to_text

router = APIRouter(prefix="/matcher", tags=["Job Description Matcher"])

# In-memory stores for local dev / testing
_dev_jobs_store: Dict[str, Any] = {}
_dev_matches_store: Dict[str, Any] = {}

@router.post("/jobs", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_job_description(
    payload: JobDescriptionCreate,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Save a job description for the user.
    """
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    skills = extract_skills_from_text(payload.description)

    job_data = {
        "id": job_id,
        "user_id": current_user.user_id,
        "job_title": payload.job_title,
        "company_name": payload.company_name or "Target Company",
        "description": payload.description,
        "extracted_skills": skills,
        "created_at": now
    }
    _dev_jobs_store[job_id] = job_data
    return JobDescriptionResponse(**job_data)

@router.get("/jobs", response_model=List[JobDescriptionResponse])
async def list_job_descriptions(current_user: UserTokenPayload = Depends(get_current_user)):
    """
    List all saved job descriptions belonging to the user.
    """
    user_jobs = [
        j for j in _dev_jobs_store.values()
        if j.get("user_id") == current_user.user_id
    ]
    user_jobs.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return [JobDescriptionResponse(**j) for j in user_jobs]

@router.post("/match", response_model=JobMatchResponse)
async def match_resume_with_job(
    payload: JobMatchRequest,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Compare a resume against a target job description.
    Accepts either saved resume_id or raw resume_text; and saved job_id or raw job_description.
    """
    resume_text = ""
    resume_title = "My Resume"

    if payload.resume_id:
        resume = _dev_resume_store.get(payload.resume_id)
        if not resume or resume.get("user_id") != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected resume not found or access denied."
            )
        resume_title = resume.get("title", "My Resume")
        resume_text = resume_content_to_text(resume.get("content", {}), resume_title)
    elif payload.resume_text:
        resume_text = payload.resume_text
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select a resume or provide resume text."
        )

    job_title = payload.job_title or "Target Role"
    company_name = payload.company_name or "Target Company"
    job_description = ""

    if payload.job_id:
        job = _dev_jobs_store.get(payload.job_id)
        if not job or job.get("user_id") != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
