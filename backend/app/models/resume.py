from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PersonalInfo(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    headline: str = ""
    website: str = ""

class EducationEntry(BaseModel):
    id: str = ""
    school: str = ""
    degree: str = ""
    field_of_study: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""
    description: str = ""

class ExperienceEntry(BaseModel):
    id: str = ""
    company: str = ""
    position: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    is_current: bool = False
    description: str = ""

class ProjectEntry(BaseModel):
    id: str = ""
    title: str = ""
    role: str = ""
    tech_stack: str = ""
    link: str = ""
    github: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""

class SkillEntry(BaseModel):
    id: str = ""
    name: str = ""
    category: str = "Technical"

class CertificationEntry(BaseModel):
    id: str = ""
    name: str = ""
    issuer: str = ""
    issue_date: str = ""
    credential_url: str = ""
    credential_id: str = ""

class AchievementEntry(BaseModel):
    id: str = ""
    title: str = ""
    description: str = ""
    date: str = ""

class SocialLink(BaseModel):
    id: str = ""
    platform: str = "LinkedIn"
    url: str = ""
    username: str = ""

class ResumeContent(BaseModel):
    career_field: str = ""
    target_role: str = ""
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str = ""
    education: List[EducationEntry] = Field(default_factory=list)
    skills: List[SkillEntry] = Field(default_factory=list)
    projects: List[ProjectEntry] = Field(default_factory=list)
    experience: List[ExperienceEntry] = Field(default_factory=list)
    certifications: List[CertificationEntry] = Field(default_factory=list)
    achievements: List[AchievementEntry] = Field(default_factory=list)
    social_links: List[SocialLink] = Field(default_factory=list)
    field_specific_info: Dict[str, Any] = Field(default_factory=dict)

class ResumeCreate(BaseModel):
    title: str = "Untitled Resume"
    template_id: str = "ats-friendly"
    content: Optional[ResumeContent] = None

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[str] = None
    content: Optional[ResumeContent] = None

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    template_id: str
    content: Dict[str, Any]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
