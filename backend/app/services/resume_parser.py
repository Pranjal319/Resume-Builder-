import io
import re
from typing import Dict, Any, List, Tuple
from fastapi import UploadFile, HTTPException, status
import pypdf
import docx

ALLOWED_EXTENSIONS = {'.pdf', '.docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

COMMON_ACTION_VERBS = {
    'accelerated', 'achieved', 'administered', 'advised', 'analyzed', 'architected',
    'automated', 'built', 'calculated', 'centralized', 'championed', 'collaborated',
    'compiled', 'configured', 'constructed', 'coordinated', 'created', 'decreased',
    'delivered', 'deployed', 'designed', 'developed', 'devised', 'directed',
    'documented', 'eliminated', 'engineered', 'enhanced', 'established', 'evaluated',
    'executed', 'expanded', 'expedited', 'facilitated', 'formulated', 'generated',
    'guided', 'implemented', 'improved', 'increased', 'initiated', 'inspected',
    'installed', 'instituted', 'integrated', 'invented', 'launched', 'led',
    'leveraged', 'managed', 'maximized', 'migrated', 'minimized', 'modernized',
    'monitored', 'negotiated', 'optimized', 'orchestrated', 'organized', 'overhauled',
    'oversaw', 'performed', 'pioneered', 'planned', 'programmed', 'published',
    'reduced', 'refactored', 'reorganized', 'resolved', 'restructured', 'revamped',
    'scaled', 'secured', 'simplified', 'spearheaded', 'standardized', 'streamlined',
    'strengthened', 'structured', 'supervised', 'surpassed', 'trained', 'transformed',
    'troubleshot', 'upgraded', 'validated', 'yielded'
}

import os

def sanitize_filename(filename: str) -> str:
    """Strip path traversal characters and sanitize filename for safe handling."""
    clean_name = os.path.basename(filename or "resume.pdf")
    clean_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', clean_name)
    return clean_name or "resume.pdf"

def validate_uploaded_file(file: UploadFile, content_bytes: bytes) -> str:
    """
    Validates file extension and size. Returns lower-case extension.
    """
    filename = sanitize_filename(file.filename)
    file.filename = filename
    ext = ""
    for allowed in ALLOWED_EXTENSIONS:
        if filename.lower().endswith(allowed):
            ext = allowed
            break

    if not ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx)."
        )

    if len(content_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowable limit of 10 MB."
        )

    return ext

def extract_text_from_pdf(content_bytes: bytes) -> str:
    """Extract clean text stream from PDF bytes."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(content_bytes))
        extracted_pages = []
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(page_text.strip())

        full_text = "\n\n".join(extracted_pages)
        # Normalize redundant spaces while preserving line breaks
        cleaned = re.sub(r'[ \t]+', ' ', full_text)
        return cleaned.strip()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse PDF text. Please ensure the document is not password-protected: {str(e)}"
        )

def extract_text_from_docx(content_bytes: bytes) -> str:
    """Extract clean text from Word (.docx) document bytes."""
    try:
        doc = docx.Document(io.BytesIO(content_bytes))
        extracted_paragraphs = []

        # 1. Paragraphs and headers
        for p in doc.paragraphs:
            text = p.text.strip()
            if text:
                extracted_paragraphs.append(text)

        # 2. Table cells
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    extracted_paragraphs.append(" | ".join(row_cells))

        full_text = "\n".join(extracted_paragraphs)
        cleaned = re.sub(r'[ \t]+', ' ', full_text)
        return cleaned.strip()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse Word document: {str(e)}"
        )

def extract_resume_text(filename: str, content_bytes: bytes) -> str:
    """Dispatch extraction based on file extension."""
    if filename.lower().endswith('.docx'):
        text = extract_text_from_docx(content_bytes)
    else:
        text = extract_text_from_pdf(content_bytes)

    if not text or len(text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded resume contains little or no extractable text. If this is a scanned image, please upload a digital vector PDF or DOCX file."
        )
    return text

def detect_resume_heuristics(text: str) -> Dict[str, Any]:
    """
    Extract factual heuristics from the raw text for anti-hallucination cross-checking.
    """
    lower_text = text.lower()

    # Detect emails
    emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    # Detect phone numbers
    phones = re.findall(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    # Detect URLs (LinkedIn, GitHub, Portfolios)
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+|linkedin\.com/[^\s<>"]+|github\.com/[^\s<>"]+', text)

    # Detect presence of core sections
    has_summary = bool(re.search(r'\b(summary|objective|about me|profile)\b', lower_text))
    has_experience = bool(re.search(r'\b(experience|employment|work history|career)\b', lower_text))
    has_education = bool(re.search(r'\b(education|university|college|degree|bachelor|master|phd)\b', lower_text))
    has_skills = bool(re.search(r'\b(skills|technologies|proficiencies|tools|competencies)\b', lower_text))
    has_projects = bool(re.search(r'\b(projects|featured projects|portfolio)\b', lower_text))
    has_certifications = bool(re.search(r'\b(certifications|certificates|licenses)\b', lower_text))

    # Detect action verbs
    words = set(re.findall(r'\b[a-zA-Z]+\b', lower_text))
    found_verbs = [verb for verb in COMMON_ACTION_VERBS if verb in words]

    # Detect quantifiable metrics (% signs, dollar signs, numbers with k/m/x, etc.)
    metrics = re.findall(r'\b\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?|\b\d+x\b|\b\d+\+?(?:\s*(?:users|clients|requests|seconds|ms|queries|latency|revenue|growth))\b', lower_text)

    return {
        "emails": list(set(emails)),
        "has_phone": len(phones) > 0,
        "urls": list(set(urls)),
        "sections": {
            "summary": has_summary,
            "experience": has_experience,
            "education": has_education,
            "skills": has_skills,
            "projects": has_projects,
            "certifications": has_certifications,
        },
        "action_verbs": found_verbs,
        "action_verb_count": len(found_verbs),
        "metrics_found": len(metrics),
        "total_words": len(lower_text.split()),
        "character_count": len(text)
    }
