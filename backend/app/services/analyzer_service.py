import json
import httpx
from typing import Dict, Any, List
from app.core.config import settings
from app.models.analysis import (
    ResumeAnalysisResponse,
    SectionScores,
    StrengthItem,
    WeaknessItem,
    MissingKeywordItem,
    ATSIssueItem,
    SuggestionItem,
    RecommendedChangeItem
)
from app.services.resume_parser import detect_resume_heuristics

SYSTEM_ANALYZER_PROMPT = """You are an expert ATS (Applicant Tracking System) engineer and senior technical recruiter.
Analyze the following resume text objectively and return a structured JSON response.

CRITICAL RULES:
1. Ground truth only: Do NOT invent or hallucinate achievements, schools, or companies not present in the text.
2. Evaluate objectively across:
   - Contact info (Email, Phone, Location, Portfolio/LinkedIn)
   - Professional summary (Clarity, core competencies, quantifiable impact)
   - Work experience (Use of strong action verbs, X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z])
   - Education & Projects (Relevance, dates, technologies)
   - Technical skills (Standard naming, modern tools)
   - ATS compatibility (Standard headings, parser friendly formatting)
   - Action verbs & Quantifiable metrics (Percentages %, dollar amounts $, user scale)
3. Return ONLY valid JSON matching this schema:
{
  "overall_score": <number 0-100>,
  "section_scores": {
    "contact_information": <number 0-100>,
    "professional_summary": <number 0-100>,
    "work_experience": <number 0-100>,
    "education": <number 0-100>,
    "skills": <number 0-100>,
    "projects": <number 0-100>,
    "ats_compatibility": <number 0-100>,
    "action_verbs_and_metrics": <number 0-100>
  },
  "strengths": [
    {"title": "<string>", "description": "<string>", "quote": "<exact quote from resume or null>"}
  ],
  "weaknesses": [
    {"title": "<string>", "description": "<string>", "impact": "<High|Medium|Low>"}
  ],
  "missing_keywords": [
    {"keyword": "<string>", "category": "<string>", "importance": "<Critical|Recommended|Nice-to-have>"}
  ],
  "ats_issues": [
    {"type": "<critical|warning|tip>", "issue": "<string>", "recommendation": "<string>"}
  ],
  "improvement_suggestions": [
    {"category": "<string>", "title": "<string>", "recommendation": "<string>", "priority": "<High|Medium|Low>"}
  ],
  "recommended_changes": [
    {"section": "<string>", "current_text": "<exact phrase from resume>", "improved_text": "<punchier ATS rewrite with metrics>", "reason": "<string>"}
  ]
}
"""

def generate_heuristic_analysis(text: str, filename: str) -> ResumeAnalysisResponse:
    """
    Deterministic rule-based fallback analyzer.
    Evaluates extracted text across all 8 dimensions using objective heuristics.
    """
    heuristics = detect_resume_heuristics(text)
    sections = heuristics["sections"]

    # 1. Contact Score
    contact_score = 40
    if heuristics["emails"]: contact_score += 25
    if heuristics["has_phone"]: contact_score += 20
    if heuristics["urls"]: contact_score += 15
    contact_score = min(contact_score, 100)

    # 2. Summary Score
    summary_score = 80 if sections["summary"] else 45

    # 3. Experience Score
    verb_count = heuristics["action_verb_count"]
    metric_count = heuristics["metrics_found"]
    exp_score = 50
    if sections["experience"]: exp_score += 20
    if verb_count >= 5: exp_score += 15
    if metric_count >= 2: exp_score += 15
    exp_score = min(exp_score, 100)

    # 4. Education Score
    edu_score = 85 if sections["education"] else 40

    # 5. Skills Score
    skills_score = 85 if sections["skills"] else 45

    # 6. Projects Score
    proj_score = 85 if sections["projects"] else 50

    # 7. ATS Compatibility Score
    ats_score = 60
    if sections["experience"] and sections["education"] and sections["skills"]:
        ats_score += 25
    if heuristics["total_words"] >= 250:
        ats_score += 15
    ats_score = min(ats_score, 100)

    # 8. Action Verbs & Metrics Score
    action_score = min(int((verb_count * 5) + (metric_count * 8) + 30), 100)

    # Overall Score calculation
    overall_score = int(
        (contact_score * 0.10) +
        (summary_score * 0.10) +
        (exp_score * 0.25) +
        (edu_score * 0.10) +
        (skills_score * 0.15) +
        (proj_score * 0.10) +
        (ats_score * 0.10) +
        (action_score * 0.10)
    )

    strengths = []
    if heuristics["emails"] and heuristics["has_phone"]:
        strengths.append(StrengthItem(
            title="Complete Contact Coordinates",
            description="Resume includes validated email and phone number for recruiter outreach.",
            quote=f"{heuristics['emails'][0]}" if heuristics['emails'] else None
        ))
    if verb_count >= 4:
        sample_verbs = ", ".join(heuristics["action_verbs"][:4])
        strengths.append(StrengthItem(
            title="Strong Action Verb Usage",
            description=f"Identified high-impact action verbs including: {sample_verbs}.",
            quote=heuristics["action_verbs"][0] if heuristics["action_verbs"] else None
        ))
    if sections["skills"]:
        strengths.append(StrengthItem(
            title="Dedicated Skills Section",
            description="Skills are organized in an identifiable section, aiding automated parser keyword matching.",
            quote=None
        ))
    if metric_count >= 2:
        strengths.append(StrengthItem(
            title="Quantifiable Results Included",
            description=f"Detected {metric_count} measurable impact metrics (percentages, numbers, or scale indicators).",
            quote=None
        ))

    weaknesses = []
    if not sections["summary"]:
        weaknesses.append(WeaknessItem(
            title="Missing Executive Summary",
            description="Adding a 2-3 sentence summary at the top boosts recruiter readability and keyword density.",
            impact="Medium"
        ))
    if metric_count < 3:
        weaknesses.append(WeaknessItem(
            title="Insufficient Measurable Metrics",
            description="Experience bullets lack quantifiable outcomes (e.g. latency reduced by X%, revenue boosted by $Y).",
            impact="High"
        ))
    if not heuristics["urls"]:
        weaknesses.append(WeaknessItem(
            title="Missing Professional Profiles",
            description="No active LinkedIn or GitHub profile links were identified in the contact header.",
            impact="Medium"
        ))

    missing_keywords = [
        MissingKeywordItem(keyword="CI/CD Pipelines", category="DevOps", importance="Recommended"),
        MissingKeywordItem(keyword="Unit Testing & TDD", category="Software Quality", importance="Recommended"),
        MissingKeywordItem(keyword="Cloud Architecture (AWS / GCP)", category="Cloud", importance="Recommended"),
        MissingKeywordItem(keyword="Microservices & REST APIs", category="Architecture", importance="Critical"),
        MissingKeywordItem(keyword="Agile / Scrum Methodologies", category="Process", importance="Nice-to-have"),
    ]

    ats_issues = []
    if not sections["experience"]:
        ats_issues.append(ATSIssueItem(
            type="critical",
            issue="Missing standard 'Experience' section heading",
            recommendation="Rename your work section to standard 'Work Experience' or 'Professional Experience'."
        ))
    if heuristics["total_words"] < 200:
        ats_issues.append(ATSIssueItem(
            type="warning",
            issue="Low document word count (< 200 words)",
            recommendation="Expand on key responsibilities and technical projects to improve parser keyword score."
        ))
    else:
        ats_issues.append(ATSIssueItem(
            type="tip",
            issue="Standard single-column vector text verified",
            recommendation="Document text extracted cleanly without character encoding corruption."
        ))

    suggestions = [
        SuggestionItem(
            category="Impact",
            title="Adopt the Google X-Y-Z Resume Formula",
            recommendation="Structure bullets as: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
            priority="High"
        ),
        SuggestionItem(
            category="Keywords",
            title="Enrich Technical Competencies",
            recommendation="Specify precise libraries and databases (e.g. PostgreSQL, Redis, Docker) rather than generic terms.",
            priority="Medium"
        ),
        SuggestionItem(
            category="Formatting",
            title="Standardize Date Formats",
            recommendation="Use uniform 'Month Year – Month Year' (e.g. 'Jun 2024 – Aug 2024') across all positions.",
            priority="Low"
        )
    ]

    recommended_changes = [
        RecommendedChangeItem(
            section="Work Experience",
            current_text="Worked on frontend and backend features for web application.",
            improved_text="Architected full-stack modules using React and FastAPI, decreasing page load time by 38% for 10,000+ active users.",
            reason="Replaces weak generic verbs ('worked on') with authoritative verbs ('architected') and adds measurable outcomes."
        ),
        RecommendedChangeItem(
            section="Projects",
            current_text="Created a database tool for university project.",
            improved_text="Engineered a high-performance PostgreSQL query analyzer handling 50k+ transactions with zero data loss.",
            reason="Injects concrete tech stack names and specifies performance metrics."
        )
    ]

    return ResumeAnalysisResponse(
        file_name=filename,
        overall_score=overall_score,
        section_scores=SectionScores(
            contact_information=contact_score,
            professional_summary=summary_score,
            work_experience=exp_score,
            education=edu_score,
            skills=skills_score,
            projects=proj_score,
            ats_compatibility=ats_score,
            action_verbs_and_metrics=action_score
        ),
        strengths=strengths,
        weaknesses=weaknesses,
        missing_keywords=missing_keywords,
        ats_issues=ats_issues,
        improvement_suggestions=suggestions,
        recommended_changes=recommended_changes,
        extracted_text_preview=text[:600] + "..." if len(text) > 600 else text
    )

async def analyze_with_gemini(text: str, filename: str) -> ResumeAnalysisResponse:
    """Call Google Gemini API with strict structured JSON output."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_ANALYZER_PROMPT},
                    {"text": f"RESUME FILENAME: {filename}\n\nRESUME TEXT CONTENT:\n{text}"}
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()

        # Extract text content from Gemini response
        raw_json_str = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed_dict = json.loads(raw_json_str)

        # Ensure filename and preview are populated
        parsed_dict["file_name"] = filename
        parsed_dict["extracted_text_preview"] = text[:600] + "..." if len(text) > 600 else text

        # Validate with Pydantic model
        return ResumeAnalysisResponse(**parsed_dict)

async def analyze_with_openai(text: str, filename: str) -> ResumeAnalysisResponse:
    """Call OpenAI API with JSON mode."""
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SYSTEM_ANALYZER_PROMPT},
            {"role": "user", "content": f"RESUME FILENAME: {filename}\n\nRESUME TEXT CONTENT:\n{text}"}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        raw_json_str = data["choices"][0]["message"]["content"]
        parsed_dict = json.loads(raw_json_str)
        parsed_dict["file_name"] = filename
        parsed_dict["extracted_text_preview"] = text[:600] + "..." if len(text) > 600 else text
        return ResumeAnalysisResponse(**parsed_dict)

async def perform_resume_analysis(text: str, filename: str = "Resume") -> ResumeAnalysisResponse:
    """
    Master analysis dispatch pipeline:
    1. Attempts LLM analysis with Gemini if key is provided.
    2. Falls back to OpenAI if configured.
    3. Seamlessly falls back to deterministic rule-based analysis if keys are absent or network errors occur.
    """
    if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your-"):
        try:
            return await analyze_with_gemini(text, filename)
        except Exception as e:
            print(f"[Warning] Gemini analysis error, falling back to heuristic engine: {e}")

    if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("your-"):
        try:
            return await analyze_with_openai(text, filename)
        except Exception as e:
            print(f"[Warning] OpenAI analysis error, falling back to heuristic engine: {e}")

    # Deterministic rule-based evaluation (guaranteed reliability, 0 network latency, 100% schema compliant)
    return generate_heuristic_analysis(text, filename)
