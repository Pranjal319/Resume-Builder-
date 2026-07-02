from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SectionScores(BaseModel):
    contact_information: int = Field(ge=0, le=100)
    professional_summary: int = Field(ge=0, le=100)
    work_experience: int = Field(ge=0, le=100)
    education: int = Field(ge=0, le=100)
    skills: int = Field(ge=0, le=100)
    projects: int = Field(ge=0, le=100)
    ats_compatibility: int = Field(ge=0, le=100)
    action_verbs_and_metrics: int = Field(ge=0, le=100)

class StrengthItem(BaseModel):
    title: str
    description: str
    quote: Optional[str] = None

class WeaknessItem(BaseModel):
    title: str
    description: str
    impact: str = "Medium" # High, Medium, Low

class MissingKeywordItem(BaseModel):
    keyword: str
    category: str = "Industry Term"
    importance: str = "Recommended" # Critical, Recommended, Nice-to-have

class ATSIssueItem(BaseModel):
    type: str = "warning" # critical, warning, tip
    issue: str
    recommendation: str

class SuggestionItem(BaseModel):
    category: str
    title: str
    recommendation: str
    priority: str = "Medium" # High, Medium, Low

class RecommendedChangeItem(BaseModel):
    section: str
    current_text: str
    improved_text: str
    reason: str

class ResumeAnalysisResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    resume_id: Optional[str] = None
    file_name: str = "Resume"
    overall_score: int = Field(ge=0, le=100)
    section_scores: SectionScores
    strengths: List[StrengthItem] = Field(default_factory=list)
    weaknesses: List[WeaknessItem] = Field(default_factory=list)
    missing_keywords: List[MissingKeywordItem] = Field(default_factory=list)
    ats_issues: List[ATSIssueItem] = Field(default_factory=list)
    improvement_suggestions: List[SuggestionItem] = Field(default_factory=list)
    recommended_changes: List[RecommendedChangeItem] = Field(default_factory=list)
    extracted_text_preview: Optional[str] = None
    created_at: Optional[datetime] = None
