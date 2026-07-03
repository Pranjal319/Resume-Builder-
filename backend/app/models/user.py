from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserTokenPayload(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class UserProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    target_role: Optional[str] = None

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: str
    email: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
