from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from .user import UserResponse
from ..models.all_models import ProjectStatus, ProjectCategory

class ProjectBase(BaseModel):
    title: str
    description: str
    tech_stack: List[str]
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    status: ProjectStatus = ProjectStatus.IDEATION
    category: ProjectCategory

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    status: Optional[ProjectStatus] = None
    category: Optional[ProjectCategory] = None

class ProjectResponse(ProjectBase):
    id: UUID
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UserResponse] = None
    team_members: List[UserResponse] = []

    model_config = ConfigDict(from_attributes=True)
