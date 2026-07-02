from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class JobDescriptionCreate(BaseModel):
    job_title: str = Field(..., min_length=2)
    company_name: Optional[str] = "Target Company"
    description: str = Field(..., min_length=20)

class JobDescriptionResponse(BaseModel):
    id: str
    user_id: str
    job_title: str
    company_name: Optional[str] = None
    description: str
    extracted_skills: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None

class DimensionScores(BaseModel):
    semantic_similarity: int = Field(ge=0, le=100)
    skills_match: int = Field(ge=0, le=100)
    experience_match: int = Field(ge=0, le=100)
    education_match: int = Field(ge=0, le=100)

class SkillMatchItem(BaseModel):
    name: str
    category: str = "General"
    is_required: bool = True
    matched: bool = False

class JobMatchRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None
    job_id: Optional[str] = None
    job_title: Optional[str] = "Target Role"
    company_name: Optional[str] = "Target Company"
    job_description: Optional[str] = None

class RecommendedChange(BaseModel):
    section: str
    suggestion: str
    rationale: str

class JobMatchResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    job_id: Optional[str] = None
    resume_id: Optional[str] = None
    job_title: str = "Target Role"
    company_name: str = "Target Company"
    resume_title: str = "My Resume"
    match_score: int = Field(ge=0, le=100)
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    dimension_scores: DimensionScores
    suitability: str = "Competitive"
    explanation: str
    recommended_changes: List[RecommendedChange] = Field(default_factory=list)
    created_at: Optional[datetime] = None
