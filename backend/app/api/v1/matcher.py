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
                detail="Selected job description not found or access denied."
            )
        job_title = job.get("job_title", job_title)
        company_name = job.get("company_name", company_name)
        job_description = job.get("description", "")
    elif payload.job_description:
        job_description = payload.job_description
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a job description text or select a saved job."
        )

    # Run multi-layer matching pipeline
    match_result = await match_resume_to_job(
        resume_text=resume_text,
        job_title=job_title,
        company_name=company_name,
        job_description=job_description,
        resume_title=resume_title
    )

    match_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    match_dict = match_result.model_dump()
    match_dict["id"] = match_id
    match_dict["user_id"] = current_user.user_id
    match_dict["job_id"] = payload.job_id
    match_dict["resume_id"] = payload.resume_id
    match_dict["created_at"] = now

    _dev_matches_store[match_id] = match_dict
    return JobMatchResponse(**match_dict)

@router.get("/matches", response_model=List[JobMatchResponse])
async def list_user_matches(current_user: UserTokenPayload = Depends(get_current_user)):
    """
    List past job matches for the authenticated user.
    """
    user_matches = [
        m for m in _dev_matches_store.values()
        if m.get("user_id") == current_user.user_id
    ]
    user_matches.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return [JobMatchResponse(**m) for m in user_matches]

@router.get("/matches/{match_id}", response_model=JobMatchResponse)
async def get_match_report(
    match_id: str,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Fetch a specific match report.
    """
    record = _dev_matches_store.get(match_id)
    if not record or record.get("user_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match report not found or access denied."
        )
    return JobMatchResponse(**record)

@router.delete("/matches/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match_report(
    match_id: str,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Delete a match report.
    """
    record = _dev_matches_store.get(match_id)
    if not record or record.get("user_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match report not found or access denied."
        )
    del _dev_matches_store[match_id]
    return None
