import re
import uuid
from typing import Dict, Any, List, Tuple, Optional
from app.models.roadmap import (
    RoadmapResponse,
    RoadmapMilestone,
    SkillGapItem
)
from app.services.matcher_service import extract_skills_from_text, partition_required_and_preferred_skills

ROLE_BLUEPRINTS: Dict[str, Dict[str, Any]] = {
    "full stack developer": {
        "canonical_name": "Full Stack Developer",
        "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Express", "REST APIs", "SQL", "PostgreSQL", "Docker", "Git"],
        "dependency_order": ["JavaScript", "TypeScript", "React", "Node.js", "Express", "REST APIs", "SQL", "PostgreSQL", "Docker", "CI/CD"],
        "levels": {
            "JavaScript": "Beginner",
            "React": "Intermediate",
            "Node.js": "Intermediate",
            "Express": "Intermediate",
            "REST APIs": "Intermediate",
            "SQL": "Intermediate",
            "PostgreSQL": "Intermediate",
            "Docker": "Advanced",
            "CI/CD": "Advanced"
        }
    },
    "frontend engineer": {
        "canonical_name": "Frontend Engineer",
        "skills": ["HTML/CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "REST APIs", "Unit Testing", "Git"],
        "dependency_order": ["HTML/CSS", "JavaScript", "TypeScript", "React", "Tailwind CSS", "Next.js", "REST APIs", "Unit Testing", "Git"],
        "levels": {
            "HTML/CSS": "Beginner",
            "JavaScript": "Beginner",
            "TypeScript": "Intermediate",
            "React": "Intermediate",
            "Tailwind CSS": "Intermediate",
            "Next.js": "Advanced",
            "REST APIs": "Intermediate",
            "Unit Testing": "Advanced"
        }
    },
    "backend engineer": {
        "canonical_name": "Backend Engineer",
        "skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "Redis", "REST APIs", "Docker", "Microservices", "Unit Testing", "Git"],
        "dependency_order": ["Python", "FastAPI", "REST APIs", "SQL", "PostgreSQL", "Redis", "Docker", "Unit Testing", "Microservices"],
        "levels": {
            "Python": "Beginner",
            "FastAPI": "Intermediate",
            "REST APIs": "Intermediate",
            "SQL": "Intermediate",
            "PostgreSQL": "Intermediate",
            "Redis": "Advanced",
            "Docker": "Advanced",
            "Microservices": "Advanced"
        }
    },
    "devops engineer": {
        "canonical_name": "DevOps & Cloud Engineer",
        "skills": ["Linux", "Git", "Docker", "Kubernetes", "AWS", "CI/CD", "REST APIs", "Microservices"],
        "dependency_order": ["Linux", "Git", "Docker", "CI/CD", "AWS", "Kubernetes", "Microservices"],
        "levels": {
            "Linux": "Beginner",
            "Git": "Beginner",
            "Docker": "Intermediate",
            "CI/CD": "Intermediate",
            "AWS": "Advanced",
            "Kubernetes": "Advanced"
        }
    },
    "data scientist": {
        "canonical_name": "Data Scientist / ML Engineer",
        "skills": ["Python", "SQL", "Data Structures & Algorithms", "Machine Learning", "Docker", "Git"],
        "dependency_order": ["Python", "SQL", "Data Structures & Algorithms", "Machine Learning", "Docker", "Git"],
        "levels": {
            "Python": "Beginner",
            "SQL": "Intermediate",
            "Data Structures & Algorithms": "Intermediate",
            "Machine Learning": "Advanced",
            "Docker": "Advanced"
        }
    }
}

def resolve_role_blueprint(target_role: str) -> Dict[str, Any]:
    """Find closest matching role blueprint or synthesize fallback blueprint."""
    target_lower = target_role.lower()
    for key, bp in ROLE_BLUEPRINTS.items():
        if key in target_lower or target_lower in key:
            return bp

    # Generic Software Engineer synthesis
    return {
        "canonical_name": target_role.title(),
        "skills": ["JavaScript", "Python", "React", "REST APIs", "SQL", "PostgreSQL", "Docker", "Git"],
        "dependency_order": ["Git", "JavaScript", "Python", "React", "REST APIs", "SQL", "PostgreSQL", "Docker"],
        "levels": {
            "Git": "Beginner",
            "JavaScript": "Beginner",
            "Python": "Beginner",
            "React": "Intermediate",
            "REST APIs": "Intermediate",
            "SQL": "Intermediate",
            "PostgreSQL": "Intermediate",
            "Docker": "Advanced"
        }
    }

def analyze_skill_gaps(
    candidate_skills: List[str],
    blueprint: Dict[str, Any],
    job_description: Optional[str] = None
) -> Tuple[List[str], List[str], List[SkillGapItem], List[str]]:
    """
    Reconciles candidate skills against blueprint and optional job posting.
    Returns (current_skills, required_skills, missing_skills, learning_order).
    """
    candidate_set = set(candidate_skills)
    bp_skills = blueprint["skills"]

    # If job description provided, extract additional JD requirements
    if job_description:
        req_jd, pref_jd = partition_required_and_preferred_skills(job_description)
        all_required = sorted(list(set(bp_skills + req_jd)))
    else:
        all_required = list(bp_skills)

    current_skills = [s for s in all_required if s in candidate_set]
    missing_skill_names = [s for s in all_required if s not in candidate_set]

    # Assign priority & difficulty levels
    missing_items = []
    dep_order = blueprint.get("dependency_order", [])
    level_dict = blueprint.get("levels", {})

    for idx, s in enumerate(missing_skill_names):
        lvl = level_dict.get(s, "Intermediate")
        priority = "Critical" if idx < 3 else ("High" if idx < 6 else "Medium")
        missing_items.append(SkillGapItem(
            name=s,
            priority=priority,
            level=lvl,
            category="Technical Skill",
            status="missing"
        ))

    # Sort missing skills according to the pedagogical dependency graph
    sorted_missing = sorted(
        missing_skill_names,
        key=lambda x: dep_order.index(x) if x in dep_order else 99
    )

    # Learning order consists of missing skills followed by Capstone Milestone
    learning_order = list(sorted_missing)
    if not learning_order:
        learning_order = ["Advanced Architecture", "System Design", "Enterprise Scalability"]

    return current_skills, all_required, missing_items, learning_order

def generate_milestones_for_duration(
    target_role: str,
    duration_days: int,
    learning_order: List[str]
) -> List[RoadmapMilestone]:
    """
    Partitions the learning sequence into structured time intervals (30, 60, or 90 days)
    with hands-on deliverables.
    """
    milestones = []
    skills = list(learning_order)

    # Duration partitioning
    if duration_days <= 30:
        # 4 phases (approx 7–8 days each)
        phase_count = 4
        timeframes = ["Days 1–7", "Days 8–15", "Days 16–22", "Days 23–30"]
    elif duration_days <= 60:
        # 5 phases (approx 12 days each)
        phase_count = 5
        timeframes = ["Days 1–12", "Days 13–24", "Days 25–36", "Days 37–48", "Days 49–60"]
    else:
        # 6 phases (approx 15 days each for 90 days)
        phase_count = 6
        timeframes = ["Days 1–15", "Days 16–30", "Days 31–45", "Days 46–60", "Days 61–75", "Days 76–90"]

    # Distribute skills across phases
    chunk_size = max(1, len(skills) // phase_count)
    
    for i in range(phase_count):
        tf = timeframes[i]
        start_idx = i * chunk_size
        if i == phase_count - 1:
            phase_skills = skills[start_idx:]
        else:
            phase_skills = skills[start_idx:start_idx + chunk_size]

        if not phase_skills:
            phase_skills = [f"Advanced {target_role} Specialization"]

        skills_str = ", ".join(phase_skills)

        # Milestone titles and practical deliverables based on phase position
        if i == 0:
            title = f"Foundational Mastery: {phase_skills[0]}"
            desc = f"Establish solid fundamentals and core syntax for {skills_str}."
            deliverable = f"Build and test modular exercises demonstrating key concepts of {phase_skills[0]}."
            resources = [f"Official {phase_skills[0]} Documentation", "MDN Web Docs / Deep-Dive Guides"]
        elif i == phase_count - 1:
            title = f"Capstone Synthesis & Deployment: {target_role}"
            desc = f"Integrate all acquired skills ({', '.join(skills[:4])}) into an end-to-end production-ready application."
            deliverable = f"Full-stack deployed application with automated CI/CD pipeline, documentation, and live demo link."
            resources = ["Cloud Architecture Best Practices", "System Design Primer", "GitHub Actions Deployment Guide"]
        else:
            title = f"Core Competency: {skills_str}"
            desc = f"Develop intermediate to advanced proficiency in {skills_str}."
            deliverable = f"Construct a micro-service or functional module implementing {phase_skills[0]}."
            resources = [f"{phase_skills[0]} Best Practices & Tutorials", "Standard Design Patterns Guide"]

        milestones.append(RoadmapMilestone(
            id=f"m-{uuid.uuid4().hex[:8]}",
            order=i + 1,
            timeframe=tf,
            title=title,
            description=desc,
            skills_covered=phase_skills,
            project_deliverable=deliverable,
            resources=resources,
            completed=False
        ))

    return milestones

def build_personalized_roadmap(
    target_role: str,
    duration_days: int = 60,
    candidate_skills: Optional[List[str]] = None,
    job_description: Optional[str] = None
) -> RoadmapResponse:
    """
    Main roadmap generation orchestrator:
    1. Resolves role blueprint
    2. Identifies verified vs missing skills
    3. Computes pedagogical dependency sequence
    4. Formulates time-bound milestones with practical deliverables
    """
    blueprint = resolve_role_blueprint(target_role)
    c_skills = candidate_skills or []

    current_skills, required_skills, missing_skills, learning_order = analyze_skill_gaps(
        candidate_skills=c_skills,
        blueprint=blueprint,
        job_description=job_description
    )

    milestones = generate_milestones_for_duration(
        target_role=blueprint["canonical_name"],
        duration_days=duration_days,
        learning_order=learning_order
    )

    return RoadmapResponse(
        target_role=blueprint["canonical_name"],
        duration_days=duration_days,
        current_skills=current_skills,
        required_skills=required_skills,
        missing_skills=missing_skills,
        learning_order=learning_order,
        milestones=milestones,
        progress_percentage=0,
        is_active=True
    )
