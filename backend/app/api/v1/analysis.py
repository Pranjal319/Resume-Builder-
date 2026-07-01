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
