from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import UserTokenPayload
from app.api.v1.resumes import _dev_resume_store
from app.api.v1.analysis import _dev_analysis_store
from app.api.v1.matcher import _dev_matches_store
from app.api.v1.roadmap import _dev_roadmaps_store

router = APIRouter(prefix="/dashboard", tags=["Career Dashboard"])

def calculate_resume_strength(resume: Optional[Dict[str, Any]]) -> int:
    """Calculate resume completeness score (0-100) based on section depth."""
    if not resume:
        return 0
    content = resume.get("content", {})
    score = 20 # Base for creating resume

    p = content.get("personal_info", {})
    if p.get("full_name") and p.get("email"): score += 15
    if content.get("summary"): score += 15
    if len(content.get("skills", [])) >= 4: score += 15
    if len(content.get("experience", [])) >= 1: score += 15
    if len(content.get("education", [])) >= 1: score += 10
    if len(content.get("projects", [])) >= 1: score += 10
    return min(100, score)

@router.get("/summary")
async def get_dashboard_summary(current_user: UserTokenPayload = Depends(get_current_user)):
    """
    Unified analytics summary aggregating stats across Resumes, ATS Analysis,
    Job Matching, and Learning Roadmaps.
    """
    user_id = current_user.user_id

    # 1. Resumes
    user_resumes = [
        r for r in _dev_resume_store.values()
        if r.get("user_id") == user_id
    ]
    user_resumes.sort(key=lambda x: str(x.get("updated_at", "")), reverse=True)
    resume_count = len(user_resumes)
    primary_resume = user_resumes[0] if user_resumes else None
    resume_strength = calculate_resume_strength(primary_resume)

    recent_resumes = [
        {
            "id": r["id"],
            "title": r.get("title", "Untitled Resume"),
            "template_id": r.get("template_id", "ats-friendly"),
            "updated_at": r.get("updated_at")
        }
        for r in user_resumes[:4]
    ]

    # 2. Latest ATS Analysis
    user_analyses = [
        a for a in _dev_analysis_store.values()
        if a.get("user_id") == user_id
    ]
    user_analyses.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
    latest_analysis = None
    if user_analyses:
        top_a = user_analyses[0]
        latest_analysis = {
            "id": top_a["id"],
            "file_name": top_a.get("file_name", "Resume"),
            "overall_score": top_a.get("overall_score", 0),
            "section_scores": top_a.get("section_scores", {}),
            "strengths_count": len(top_a.get("strengths", [])),
            "weaknesses_count": len(top_a.get("weaknesses", [])),
            "ats_issues_count": len(top_a.get("ats_issues", [])),
            "created_at": top_a.get("created_at")
        }

    # 3. Job Matches
    user_matches = [
        m for m in _dev_matches_store.values()
        if m.get("user_id") == user_id
    ]
    user_matches.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
    job_matches_count = len(user_matches)

    best_job_match = None
    if user_matches:
