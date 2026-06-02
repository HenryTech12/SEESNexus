import re
from datetime import datetime
from typing import List, Optional
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.all_models import Article, User, UserRole, ArticleStatus
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse
from app.schemas.response import StandardResponse
from app.middleware.auth_middleware import get_current_user, require_contributor

router = APIRouter(prefix="/articles", tags=["articles"])

def generate_slug(title: str) -> str:
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[\s_-]+', '-', slug).strip('-')
    return slug

async def get_unique_slug(title: str, db: AsyncSession) -> str:
    base_slug = generate_slug(title)
    slug = base_slug
    counter = 1
    while True:
        result = await db.execute(select(Article).where(Article.slug == slug))
        if not result.scalars().first():
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"

@router.get("/", response_model=StandardResponse)
async def get_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[ArticleStatus] = None,
    tag: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user), # Optional auth
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    query = select(Article).options(selectinload(Article.author))
    
    # Visibility logic
    if not current_user or current_user.role == UserRole.STUDENT:
        # Only see published
        query = query.where(Article.status == ArticleStatus.PUBLISHED)
    else:
        # CONTRIBUTORS and ADMINS see published OR their own
        query = query.where(
            or_(
                Article.status == ArticleStatus.PUBLISHED,
                Article.author_id == current_user.id
            )
        )
    
    if status and (not current_user or current_user.role != UserRole.STUDENT):
        query = query.where(Article.status == status)
        
    # JSON tag filter (PostgreSQL specific or generic JSON approach)
    # For now, a simple check if tag is in the JSON list
    # result = await db.execute(query.offset(offset).limit(limit))
    # Note: SQLite doesn't support JSON_CONTAINS easily, but we'll use a more generic approach if needed.
    # We'll just fetch and filter in memory if tag is provided, or use SQLAlchemy JSON functions
    
    # Better approach for tags if using PostgreSQL:
    # if tag:
    #     query = query.where(Article.tags.contains([tag]))
    
    result = await db.execute(query.offset(offset).limit(limit))
    articles = result.scalars().all()
    
    # Filtering tags in memory for simplicity/compatibility if needed, 
    # but let's try to do it in SQL if possible.
    if tag:
        # Re-filter or update query
        articles = [a for a in articles if tag in (a.tags or [])]
        total = len(articles) # This isn't great for pagination but works for small sets
        pages = ceil(total / limit)
    else:
        count_query = select(func.count(Article.id))
        if not current_user or current_user.role == UserRole.STUDENT:
            count_query = count_query.where(Article.status == ArticleStatus.PUBLISHED)
        else:
            count_query = count_query.where(or_(Article.status == ArticleStatus.PUBLISHED, Article.author_id == current_user.id))
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        pages = ceil(total / limit) if total > 0 else 0

    return StandardResponse(
        message="Articles retrieved",
        data={
            "articles": [ArticleResponse.model_validate(a) for a in articles],
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": pages
            }
        }
    )

@router.get("/{slug}", response_model=StandardResponse)
async def get_article(slug: str, current_user: Optional[User] = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Article)
        .where(Article.slug == slug)
        .options(selectinload(Article.author))
    )
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Visibility check
    if article.status != ArticleStatus.PUBLISHED:
        if not current_user or (article.author_id != current_user.id and current_user.role != UserRole.ADMIN):
            raise HTTPException(status_code=403, detail="Not authorized to view this article")
            
    return StandardResponse(message="Article retrieved", data=ArticleResponse.model_validate(article))

@router.post("/", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    article_in: ArticleCreate,
    current_user: User = Depends(require_contributor),
    db: AsyncSession = Depends(get_db)
):
    slug = await get_unique_slug(article_in.title, db)
    published_at = datetime.utcnow() if article_in.status == ArticleStatus.PUBLISHED else None
    
    new_article = Article(
        **article_in.model_dump(),
        slug=slug,
        author_id=current_user.id,
        published_at=published_at
    )
    db.add(new_article)
    await db.commit()
    
    # Reload
    result = await db.execute(
        select(Article)
        .where(Article.id == new_article.id)
        .options(selectinload(Article.author))
    )
    article = result.scalars().first()
    
    return StandardResponse(message="Article created", data=ArticleResponse.model_validate(article))

@router.put("/{slug}", response_model=StandardResponse)
async def update_article(
    slug: str,
    article_in: ArticleUpdate,
    current_user: User = Depends(require_contributor),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Article).where(Article.slug == slug))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    if article.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    update_data = article_in.model_dump(exclude_unset=True)
    
    if "title" in update_data and update_data["title"] != article.title:
        article.slug = await get_unique_slug(update_data["title"], db)
        
    if "status" in update_data:
        if update_data["status"] == ArticleStatus.PUBLISHED and article.published_at is None:
            article.published_at = datetime.utcnow()
            
    for field, value in update_data.items():
        setattr(article, field, value)
        
    await db.commit()
    
    # Reload
    result = await db.execute(
        select(Article)
        .where(Article.id == article.id)
        .options(selectinload(Article.author))
    )
    article = result.scalars().first()
    
    return StandardResponse(message="Article updated", data=ArticleResponse.model_validate(article))

@router.delete("/{slug}", response_model=StandardResponse)
async def delete_article(
    slug: str,
    current_user: User = Depends(require_contributor),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Article).where(Article.slug == slug))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    if article.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await db.delete(article)
    await db.commit()
    return StandardResponse(message="Article deleted successfully")
