import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.core.security import get_current_user
from app.models.user import UserTokenPayload
from app.models.analysis import ResumeAnalysisResponse
from app.services.resume_parser import validate_uploaded_file, extract_resume_text
from app.services.analyzer_service import perform_resume_analysis
from app.api.v1.resumes import _dev_resume_store

router = APIRouter(prefix="/analysis", tags=["Resume Analysis"])

# In-memory store for local development / testing
_dev_analysis_store: Dict[str, Any] = {}

def resume_content_to_text(content: Dict[str, Any], title: str = "Resume") -> str:
    """Format structured resume builder content into coherent text for analysis."""
    lines = [title]
    p = content.get("personal_info", {})
    if p.get("full_name"): lines.append(p["full_name"])
    if p.get("headline"): lines.append(p["headline"])
    contact = [v for v in [p.get("email"), p.get("phone"), p.get("location"), p.get("website")] if v]
    if contact: lines.append(" | ".join(contact))

    if content.get("summary"):
        lines.append("\nPROFESSIONAL SUMMARY")
        lines.append(content["summary"])

    if content.get("skills"):
        lines.append("\nTECHNICAL SKILLS")
        skill_names = [s.get("name") for s in content["skills"] if s.get("name")]
        lines.append(", ".join(skill_names))

    if content.get("experience"):
        lines.append("\nWORK EXPERIENCE")
        for exp in content["experience"]:
            lines.append(f"{exp.get('position')} - {exp.get('company')} ({exp.get('start_date')} - {exp.get('end_date')})")
            if exp.get("description"):
                lines.append(exp["description"])

    if content.get("projects"):
        lines.append("\nPROJECTS")
        for proj in content["projects"]:
            lines.append(f"{proj.get('title')} ({proj.get('tech_stack')})")
            if proj.get("description"):
                lines.append(proj["description"])

    if content.get("education"):
        lines.append("\nEDUCATION")
        for edu in content["education"]:
            lines.append(f"{edu.get('school')} - {edu.get('degree')} in {edu.get('field_of_study')} (GPA: {edu.get('gpa')})")

    if content.get("certifications"):
        lines.append("\nCERTIFICATIONS")
        for cert in content["certifications"]:
            lines.append(f"{cert.get('name')} - {cert.get('issuer')}")

    if content.get("achievements"):
        lines.append("\nHONORS & ACHIEVEMENTS")
        for ach in content["achievements"]:
            lines.append(f"{ach.get('title')}: {ach.get('description')}")

    return "\n".join(lines)

@router.post("/upload", response_model=ResumeAnalysisResponse)
async def analyze_uploaded_resume(
    file: UploadFile = File(...),
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Ingest, validate, extract, and analyze an uploaded PDF or Word (.docx) resume.
    """
    content_bytes = await file.read()
    validate_uploaded_file(file, content_bytes)

    filename = file.filename or "Uploaded_Resume.pdf"
    extracted_text = extract_resume_text(filename, content_bytes)

    # Run AI / Heuristic Analysis
    analysis = await perform_resume_analysis(extracted_text, filename)

    # Persist record
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    analysis_dict = analysis.model_dump()
    analysis_dict["id"] = analysis_id
    analysis_dict["user_id"] = current_user.user_id
    analysis_dict["created_at"] = now

    _dev_analysis_store[analysis_id] = analysis_dict

    return ResumeAnalysisResponse(**analysis_dict)

@router.post("/resume/{resume_id}", response_model=ResumeAnalysisResponse)
async def analyze_saved_resume(
    resume_id: str,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Run ATS analysis on an existing resume created in the Resume Builder.
    """
    resume = _dev_resume_store.get(resume_id)
    if not resume or resume["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )

    title = resume.get("title", "Resume")
    content = resume.get("content", {})
    text = resume_content_to_text(content, title)

    analysis = await perform_resume_analysis(text, f"{title}.pdf")

    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    analysis_dict = analysis.model_dump()
    analysis_dict["id"] = analysis_id
    analysis_dict["user_id"] = current_user.user_id
    analysis_dict["resume_id"] = resume_id
    analysis_dict["created_at"] = now

    _dev_analysis_store[analysis_id] = analysis_dict

    return ResumeAnalysisResponse(**analysis_dict)

@router.get("", response_model=List[ResumeAnalysisResponse])
async def list_user_analyses(current_user: UserTokenPayload = Depends(get_current_user)):
    """
    List all previous resume analyses belonging to the authenticated user.
    """
    user_records = [
        r for r in _dev_analysis_store.values()
        if r.get("user_id") == current_user.user_id
    ]
    user_records.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return [ResumeAnalysisResponse(**r) for r in user_records]

@router.get("/{analysis_id}", response_model=ResumeAnalysisResponse)
async def get_analysis_report(
    analysis_id: str,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Fetch a specific historical analysis report.
    """
    record = _dev_analysis_store.get(analysis_id)
    if not record or record.get("user_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis report not found or access denied."
        )
    return ResumeAnalysisResponse(**record)

@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis_report(
    analysis_id: str,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Delete an analysis report.
    """
    record = _dev_analysis_store.get(analysis_id)
    if not record or record.get("user_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis report not found or access denied."
        )
    del _dev_analysis_store[analysis_id]
    return None
