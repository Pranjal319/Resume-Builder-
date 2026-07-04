import re
from typing import Dict, Any, List, Tuple, Optional
from app.models.job_matcher import (
    JobMatchResponse,
    DimensionScores,
    RecommendedChange
)
from app.services.embedding_service import compute_semantic_similarity

# Canonical skill taxonomy with aliases
TECH_SKILL_CATALOG: Dict[str, List[str]] = {
    "Python": ["python", "py", "python3"],
    "JavaScript": ["javascript", "js", "ecmascript"],
    "TypeScript": ["typescript", "ts"],
    "React": ["react", "react.js", "reactjs"],
    "Next.js": ["next.js", "nextjs", "next"],
    "Node.js": ["node.js", "nodejs", "node"],
    "FastAPI": ["fastapi", "fast-api"],
    "Django": ["django", "django-rest-framework", "drf"],
    "Flask": ["flask"],
    "SQL": ["sql", "relational database", "rdbms"],
    "PostgreSQL": ["postgresql", "postgres", "psql"],
    "MySQL": ["mysql"],
    "MongoDB": ["mongodb", "mongo", "nosql"],
    "Redis": ["redis", "in-memory cache"],
    "Docker": ["docker", "containerization", "containers"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "Google Cloud (GCP)": ["gcp", "google cloud", "google cloud platform"],
    "Azure": ["azure", "microsoft azure"],
    "Git": ["git", "github", "gitlab"],
    "CI/CD": ["ci/cd", "continuous integration", "github actions", "jenkins"],
    "REST APIs": ["rest api", "restful", "rest apis", "rest endpoints"],
    "GraphQL": ["graphql"],
    "Tailwind CSS": ["tailwind", "tailwindcss"],
    "HTML/CSS": ["html", "css", "html5", "css3"],
    "Linux": ["linux", "unix", "bash", "shell scripting"],
    "Unit Testing": ["unit testing", "pytest", "jest", "tdd", "test driven development"],
    "Microservices": ["microservices", "distributed systems", "event-driven"],
    "Machine Learning": ["machine learning", "ml", "deep learning", "pytorch", "tensorflow"],
    "Data Structures & Algorithms": ["data structures", "algorithms", "dsa"]
}

def extract_skills_from_text(text: str) -> List[str]:
    """Scan text against the tech taxonomy and return canonical skill names."""
    lower_text = text.lower()
    found = []
    for canonical, aliases in TECH_SKILL_CATALOG.items():
        for alias in aliases:
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, lower_text):
                found.append(canonical)
                break
    return found

def partition_required_and_preferred_skills(job_text: str) -> Tuple[List[str], List[str]]:
    """
    Split job text into granular clauses (by line breaks, bullets, or sentence terminators)
    to classify skills into Required vs Preferred accurately.
    """
    # Split by newlines, bullets, or sentence boundaries
    clauses = re.split(r'[\n\r]+|[•\-\*]\s*|[;]\s*|(?<=[.!?])\s+', job_text)
    
    current_mode = "required"
    required_skills = set()
    preferred_skills = set()

    for clause in clauses:
        clause_clean = clause.strip()
        if not clause_clean:
            continue
        lower_clause = clause_clean.lower()

        # Check mode switch
        if any(h in lower_clause for h in ["preferred", "nice to have", "bonus", "plus", "desired", "beneficial"]):
            current_mode = "preferred"
        elif any(h in lower_clause for h in ["required", "must have", "minimum qualification", "requirements", "responsibilities", "essential"]):
            current_mode = "required"

        clause_skills = extract_skills_from_text(clause_clean)
        if current_mode == "preferred":
            preferred_skills.update(clause_skills)
        else:
            required_skills.update(clause_skills)

    # Any skill marked required takes precedence over preferred
    preferred_skills = preferred_skills - required_skills

    # If parsing found no explicit split, classify first 70% as required, 30% preferred
    if not required_skills and not preferred_skills:
        all_skills = extract_skills_from_text(job_text)
        cutoff = max(1, int(len(all_skills) * 0.7))
        required_skills = set(all_skills[:cutoff])
        preferred_skills = set(all_skills[cutoff:])
    elif not required_skills and preferred_skills:
        # If everything fell into preferred, shift non-preferred ones
        all_s = list(preferred_skills)
        required_skills = set(all_s[:max(1, len(all_s)//2)])
        preferred_skills = set(all_s[len(all_s)//2:])

    return sorted(list(required_skills)), sorted(list(preferred_skills))

def evaluate_experience_match(resume_text: str, job_text: str) -> int:
    """Compare required years of experience and seniority."""
    lower_job = job_text.lower()
    lower_resume = resume_text.lower()

    # Detect required years in JD (e.g. '3+ years', '5 years')
    exp_matches = re.findall(r'(\d+)\+?\s*(?:years|yrs)\b', lower_job)
    required_years = max([int(y) for y in exp_matches]) if exp_matches else 2

    # Detect years in resume
    resume_exp = re.findall(r'(\d+)\+?\s*(?:years|yrs)\b', lower_resume)
    candidate_years = max([int(y) for y in resume_exp]) if resume_exp else 3

    # Count experience entries if years not explicitly stated
    pos_count = len(re.findall(r'\b(20\d\d)\b', resume_text)) // 2
    if pos_count > candidate_years:
        candidate_years = pos_count

    if candidate_years >= required_years:
        return 95
    elif candidate_years >= required_years - 1:
        return 80
    else:
        return max(45, int((candidate_years / max(1, required_years)) * 85))

def evaluate_education_match(resume_text: str, job_text: str) -> int:
    """Evaluate degree level and relevance."""
    lower_job = job_text.lower()
    lower_resume = resume_text.lower()

    req_phd = "phd" in lower_job or "doctorate" in lower_job
    req_masters = "master" in lower_job or "m.s." in lower_job or "ms in" in lower_job
    req_bachelors = "bachelor" in lower_job or "b.s." in lower_job or "b.tech" in lower_job or "degree" in lower_job

    cand_phd = "phd" in lower_resume or "doctorate" in lower_resume
    cand_masters = "master" in lower_resume or "m.s." in lower_resume or "ms in" in lower_resume
    cand_bachelors = "bachelor" in lower_resume or "b.s." in lower_resume or "b.tech" in lower_resume or "degree" in lower_resume or "university" in lower_resume

    if req_phd:
        return 100 if cand_phd else (75 if cand_masters else 55)
    if req_masters:
        return 100 if (cand_masters or cand_phd) else (80 if cand_bachelors else 50)
    if req_bachelors:
        return 100 if (cand_bachelors or cand_masters or cand_phd) else 70
    return 92 # No strict degree enforced

async def match_resume_to_job(
    resume_text: str,
    job_title: str,
    company_name: str,
    job_description: str,
    resume_title: str = "My Resume"
) -> JobMatchResponse:
    """
    Main matching pipeline implementing the 4-layer hybrid architecture:
    1. Semantic vector similarity (30%)
    2. Hard technical skill matching (35%)
    3. Experience & Seniority match (20%)
    4. Education & Credentials match (15%)
    """
    # 1. Semantic Embedding Similarity
    raw_sim = await compute_semantic_similarity(resume_text, job_description)
    # Calibrate cosine similarity for document matching: cosine of 0.4+ in TF-IDF or dense embeddings is very high
    if raw_sim >= 0.5:
        semantic_score = min(100, 80 + int((raw_sim - 0.5) * 40))
    elif raw_sim >= 0.25:
        semantic_score = int(60 + ((raw_sim - 0.25) / 0.25) * 20)
    else:
        semantic_score = max(20, int(raw_sim * 240))

    # 2. Skill Extraction & Matching
    required_skills, preferred_skills = partition_required_and_preferred_skills(job_description)
    resume_skills = set(extract_skills_from_text(resume_text))

    matching_skills = []
    missing_skills = []

    for s in required_skills:
        if s in resume_skills:
            matching_skills.append(s)
        else:
            missing_skills.append(s)

    for s in preferred_skills:
        if s in resume_skills:
            if s not in matching_skills: matching_skills.append(s)
        else:
            if s not in missing_skills: missing_skills.append(s)

    # Calculate skill score (75% required, 25% preferred)
    req_match_count = sum(1 for s in required_skills if s in resume_skills)
    req_ratio = req_match_count / max(1, len(required_skills)) if required_skills else 1.0

    pref_match_count = sum(1 for s in preferred_skills if s in resume_skills)
    pref_ratio = pref_match_count / max(1, len(preferred_skills)) if preferred_skills else 1.0

    skill_score = min(100, int((req_ratio * 75) + (pref_ratio * 25)))

    # 3. Experience Match
    experience_score = evaluate_experience_match(resume_text, job_description)

    # 4. Education Match
    education_score = evaluate_education_match(resume_text, job_description)

    # 5. Composite Match Score
    overall_match = int(
        (semantic_score * 0.30) +
        (skill_score * 0.35) +
        (experience_score * 0.20) +
        (education_score * 0.15)
    )

    # Determine suitability tier
    if overall_match >= 82:
        suitability = "Strong Match"
    elif overall_match >= 68:
        suitability = "Competitive Match"
    elif overall_match >= 50:
        suitability = "Partial / Stretch Match"
    else:
        suitability = "Low Alignment"

    # 6. Generate Natural Language Explanation (WHY this score was generated)
    explanation_parts = [
        f"Overall suitability is evaluated as '{suitability}' with a composite score of {overall_match}%.",
        f"Contextual semantic alignment scored {semantic_score}%, reflecting {'strong' if semantic_score >= 70 else 'moderate'} thematic overlap between your experience and {company_name}'s domain.",
        f"You match {len(matching_skills)} target technologies ({', '.join(matching_skills[:5])}{'...' if len(matching_skills) > 5 else ''}).",
    ]
    if missing_skills:
        explanation_parts.append(
            f"Key missing skills include: {', '.join(missing_skills[:4])}."
        )
    explanation_parts.append(
        f"Experience alignment is {experience_score}% and education credentials scored {education_score}%."
    )
    explanation = " ".join(explanation_parts)

    # 7. Recommended Resume Changes
    recommended_changes = []
    if missing_skills:
        sample_missing = ", ".join(missing_skills[:3])
        recommended_changes.append(RecommendedChange(
            section="Skills",
            suggestion=f"Integrate missing target skills ({sample_missing}) into your skills and project sections.",
            rationale="ATS screeners and recruiters prioritize direct keyword hits for primary qualifications."
        ))
    if len(matching_skills) > 0:
        recommended_changes.append(RecommendedChange(
            section="Work Experience",
            suggestion=f"Spotlight your hands-on achievements with {matching_skills[0]} in your top experience bullets.",
            rationale=f"The job description for {job_title} frequently cites {matching_skills[0]} as a core competency."
        ))
    recommended_changes.append(RecommendedChange(
        section="Professional Summary",
        suggestion=f"Align your professional headline to match the job title: '{job_title} | {matching_skills[0] if matching_skills else 'Full-Stack'} Specialist'.",
        rationale="Creates immediate visual relevance during recruiter and hiring manager review."
    ))

    return JobMatchResponse(
        job_title=job_title,
        company_name=company_name,
        resume_title=resume_title,
        match_score=overall_match,
        matching_skills=matching_skills,
        missing_skills=missing_skills,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        dimension_scores=DimensionScores(
            semantic_similarity=semantic_score,
            skills_match=skill_score,
            experience_match=experience_score,
            education_match=education_score
        ),
        suitability=suitability,
        explanation=explanation,
        recommended_changes=recommended_changes
    )

async def rank_multiple_jobs(
    resume_text: str,
    job_list: List[Dict[str, str]],
    resume_title: str = "My Resume"
) -> List[JobMatchResponse]:
    """
    Multi-job ranking engine:
    Matches a single resume against an arbitrary list of job descriptions and returns
    matches sorted by match_score descending.
    """
    results = []
    for job in job_list:
        match_res = await match_resume_to_job(
            resume_text=resume_text,
            job_title=job.get("job_title", "Target Role"),
            company_name=job.get("company_name", "Target Company"),
            job_description=job.get("description", ""),
            resume_title=resume_title
        )
        results.append(match_res)

    results.sort(key=lambda x: x.match_score, reverse=True)
    return results
