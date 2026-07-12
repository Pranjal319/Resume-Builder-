import uuid
import re
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from app.core.security import get_current_user, optional_security
from app.models.user import UserTokenPayload
from app.models.resume import (
    ResumeCreate,
    ResumeUpdate,
    ResumeResponse,
    ResumeContent
)
from app.services.pdf_generator import generate_resume_pdf

router = APIRouter(prefix="/resumes", tags=["Resumes"])

# In-memory storage for local dev / testing
_dev_resume_store = {}

def get_safe_filename(title: str, name: str) -> str:
    """Generate a clean, sanitized PDF filename."""
    base = name or title or "Resume"
    clean = re.sub(r'[^a-zA-Z0-9_-]', '_', base).strip('_')
    return f"{clean}_Resume.pdf" if not clean.lower().endswith("resume") else f"{clean}.pdf"

@router.get("", response_model=List[ResumeResponse])
async def list_resumes(current_user: UserTokenPayload = Depends(get_current_user)):
    """
    List all resumes belonging to the authenticated user.
    """
    user_resumes = [
        resume for resume in _dev_resume_store.values()
        if resume["user_id"] == current_user.user_id
    ]
    user_resumes.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return user_resumes

@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    payload: ResumeCreate,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Create a new resume for the authenticated user.
    """
    resume_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    content_dict = payload.content.model_dump() if payload.content else ResumeContent().model_dump()

    new_resume = {
        "id": resume_id,
        "user_id": current_user.user_id,
        "title": payload.title or "Untitled Resume",
        "template_id": payload.template_id or "ats-friendly",
        "content": content_dict,
        "created_at": now,
        "updated_at": now
    }

    _dev_resume_store[resume_id] = new_resume
    return new_resume

@router.post("/export-pdf")
async def export_resume_pdf(payload: Dict[str, Any]):
    """
    Generate and download resume PDF dynamically from the active editor payload.
    Supports both 'ats-friendly' and 'modern-professional' templates.
    """
    title = payload.get("title") or "Resume"
    template_id = payload.get("template_id") or "ats-friendly"
    content = payload.get("content") or {}

    try:
        pdf_bytes = generate_resume_pdf(
            content=content,
            template_id=template_id,
            title=title
        )

        full_name = content.get("personal_info", {}).get("full_name", "")
        filename = get_safe_filename(title, full_name)

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Fetch a single resume by ID.
    """
    resume = _dev_resume_store.get(resume_id)
    if not resume or resume["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )
    return resume

@router.get("/{resume_id}/pdf")
async def download_resume_pdf(
    resume_id: str,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Download PDF directly for a saved resume record.
    """
    resume = _dev_resume_store.get(resume_id)
    if not resume or resume["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )

    content = resume.get("content", {})
    template_id = resume.get("template_id", "ats-friendly")
    title = resume.get("title", "Resume")

    pdf_bytes = generate_resume_pdf(
        content=content,
        template_id=template_id,
        title=title
    )

    full_name = content.get("personal_info", {}).get("full_name", "")
    filename = get_safe_filename(title, full_name)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    payload: ResumeUpdate,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Update resume metadata or content (autosave endpoint).
    """
    resume = _dev_resume_store.get(resume_id)
    if not resume or resume["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )

    if payload.title is not None:
        resume["title"] = payload.title
    if payload.template_id is not None:
        resume["template_id"] = payload.template_id
    if payload.content is not None:
        resume["content"] = payload.content.model_dump()

    resume["updated_at"] = datetime.now(timezone.utc)
    _dev_resume_store[resume_id] = resume
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: str,
    current_user: UserTokenPayload = Depends(get_current_user)
):
    """
    Delete a resume by ID.
    """
    resume = _dev_resume_store.get(resume_id)
    if not resume or resume["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )

    del _dev_resume_store[resume_id]
    return None
