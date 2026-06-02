from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.all_models import ArticleStatus

class ArticleBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    tags: Optional[List[str]] = []
    status: Optional[ArticleStatus] = ArticleStatus.DRAFT

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[ArticleStatus] = None

class ArticleAuthorResponse(BaseModel):
    id: UUID
    full_name: str
    profile_image_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ArticleResponse(ArticleBase):
    id: UUID
    slug: str
    author_id: UUID
    author: ArticleAuthorResponse
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
