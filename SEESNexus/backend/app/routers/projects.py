from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.database import get_db
from math import ceil
from app.models.all_models import Project, User, ProjectMember, ProjectStatus, ProjectCategory
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.response import StandardResponse
from app.middleware.auth_middleware import get_current_user, require_contributor

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=StandardResponse)
async def get_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[ProjectStatus] = None,
    category: Optional[ProjectCategory] = None,
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    query = select(Project).options(selectinload(Project.team_members), selectinload(Project.created_by))
    
    if status:
        query = query.where(Project.status == status)
    if category:
        query = query.where(Project.category == category)
    
    result = await db.execute(query.offset(offset).limit(limit))
    projects = result.scalars().all()
    
    # Count total for metadata
    count_query = select(func.count(Project.id))
    if status:
        count_query = count_query.where(Project.status == status)
    if category:
        count_query = count_query.where(Project.category == category)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    pages = ceil(total / limit) if total > 0 else 0

    return StandardResponse(
        message="Projects retrieved",
        data={
            "projects": [ProjectResponse.model_validate(p) for p in projects],
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": pages
            }
        }
    )

@router.post("/", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(require_contributor),
    db: AsyncSession = Depends(get_db)
):
    new_project = Project(
        **project_in.model_dump(),
        created_by_id=current_user.id
    )
    db.add(new_project)
    await db.commit()
    
    # Reload with relationships
    result = await db.execute(
        select(Project)
        .where(Project.id == new_project.id)
        .options(selectinload(Project.team_members), selectinload(Project.created_by))
    )
    project = result.scalars().first()
    
    return StandardResponse(
        message="Project created successfully",
        data=ProjectResponse.model_validate(project)
    )

@router.get("/{id}", response_model=StandardResponse)
async def get_project(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project)
        .where(Project.id == id)
        .options(selectinload(Project.team_members), selectinload(Project.created_by))
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return StandardResponse(message="Project retrieved", data=ProjectResponse.model_validate(project))

@router.put("/{id}", response_model=StandardResponse)
async def update_project(
    id: str,
    project_in: ProjectUpdate,
    current_user: User = Depends(require_contributor),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Project).where(Project.id == id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check ownership or admin
    if project.created_by_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    for field, value in project_in.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    
    await db.commit()
    
    # Reload with relationships
    result = await db.execute(
        select(Project)
        .where(Project.id == id)
        .options(selectinload(Project.team_members), selectinload(Project.created_by))
    )
    project = result.scalars().first()
    
    return StandardResponse(message="Project updated", data=ProjectResponse.model_validate(project))

@router.delete("/{id}", response_model=StandardResponse)
async def delete_project(
    id: str,
    current_user: User = Depends(get_current_user), # require_admin or owner
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Project).where(Project.id == id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.created_by_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    await db.delete(project)
    await db.commit()
    return StandardResponse(message="Project deleted successfully")
