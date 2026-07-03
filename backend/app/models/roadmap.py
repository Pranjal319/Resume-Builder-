from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SkillGapItem(BaseModel):
    name: str
    priority: str = "High" # Critical, High, Medium, Low
    level: str = "Intermediate" # Beginner, Intermediate, Advanced
    category: str = "General"
    status: str = "missing" # current, missing

class RoadmapMilestone(BaseModel):
    id: str
    order: int
    timeframe: str # e.g. "Days 1–7" or "Week 1–2"
    title: str
    description: str
    skills_covered: List[str] = Field(default_factory=list)
    project_deliverable: str
    resources: List[str] = Field(default_factory=list)
    completed: bool = False

class RoadmapGenerateRequest(BaseModel):
    target_role: str = Field(..., min_length=2)
    duration_days: int = Field(default=60) # 30, 60, or 90
    resume_id: Optional[str] = None
    job_description: Optional[str] = None
    custom_skills: Optional[List[str]] = None

class MilestoneToggleRequest(BaseModel):
    completed: bool

class RoadmapResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    target_role: str
    duration_days: int
    current_skills: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    missing_skills: List[SkillGapItem] = Field(default_factory=list)
    learning_order: List[str] = Field(default_factory=list)
    milestones: List[RoadmapMilestone] = Field(default_factory=list)
    progress_percentage: int = Field(default=0, ge=0, le=100)
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
