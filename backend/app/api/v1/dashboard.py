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
        highest = max(user_matches, key=lambda x: x.get("match_score", 0))
        best_job_match = {
            "id": highest["id"],
            "job_title": highest.get("job_title", "Target Role"),
            "company_name": highest.get("company_name", "Company"),
            "match_score": highest.get("match_score", 0),
            "suitability": highest.get("suitability", "Competitive"),
            "created_at": highest.get("created_at")
        }

    # 4. Aggregated Missing Skills
    skill_frequency: Dict[str, int] = {}
    for m in user_matches:
        for s in m.get("missing_skills", []):
            skill_frequency[s] = skill_frequency.get(s, 0) + 1

    top_missing_skills = [
        {"name": skill, "count": count, "priority": "Critical" if count >= 2 else "High"}
        for skill, count in sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)[:6]
    ]

    # 5. Active Learning Roadmap
    user_roadmaps = [
        r for r in _dev_roadmaps_store.values()
        if r.get("user_id") == user_id and r.get("is_active")
    ]
    active_roadmap = None
    if user_roadmaps:
        r = user_roadmaps[0]
        milestones = r.get("milestones", [])
        next_m = next((m for m in milestones if not m.get("completed")), None)
        active_roadmap = {
            "id": r["id"],
            "target_role": r.get("target_role", "Target Role"),
            "duration_days": r.get("duration_days", 60),
            "progress_percentage": r.get("progress_percentage", 0),
            "total_milestones": len(milestones),
            "completed_milestones": sum(1 for m in milestones if m.get("completed")),
            "next_milestone": next_m,
            "missing_skills_count": len(r.get("missing_skills", [])),
            "updated_at": r.get("updated_at")
        }

    # 6. Profile Completeness Heuristic
    # Default profile completeness based on filled data
    profile_completeness = 80 if current_user.email else 40

    # 7. Composite Interview Readiness Score (0-100)
    ats_score = latest_analysis["overall_score"] if latest_analysis else 60
    match_score = best_job_match["match_score"] if best_job_match else 60
    roadmap_prog = active_roadmap["progress_percentage"] if active_roadmap else 30

    interview_readiness = int(
        (0.20 * profile_completeness) +
        (0.25 * resume_strength) +
        (0.25 * ats_score) +
        (0.15 * match_score) +
        (0.15 * roadmap_prog)
    )

    return {
        "profile_completeness": profile_completeness,
        "resume_strength_score": resume_strength,
        "resume_count": resume_count,
        "recent_resumes": recent_resumes,
        "latest_ats_analysis": latest_analysis,
        "job_matches_count": job_matches_count,
        "best_job_match": best_job_match,
        "top_missing_skills": top_missing_skills,
        "active_roadmap": active_roadmap,
        "interview_readiness_score": interview_readiness
    }
