from typing import List, Optional
from math import ceil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from app.database import get_db
from app.models.all_models import User, Project, HardwareLoan, Event, LoanStatus, Hardware, UserRole, Article, EventRegistration
from app.schemas.user import UserResponse, UserRoleUpdate
from app.schemas.response import StandardResponse
from app.schemas.loan import LoanResponse
from app.schemas.event import EventRegistrationResponse
from app.middleware.auth_middleware import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard", response_model=StandardResponse)
async def get_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_projects = (await db.execute(select(func.count(Project.id)))).scalar()
    active_loans = (await db.execute(select(func.count(HardwareLoan.id)).where(HardwareLoan.status == LoanStatus.APPROVED))).scalar()
    pending_loans = (await db.execute(select(func.count(HardwareLoan.id)).where(HardwareLoan.status == LoanStatus.PENDING))).scalar()
    upcoming_events = (await db.execute(select(func.count(Event.id)).where(Event.start_date > datetime.utcnow()))).scalar()
    total_articles = (await db.execute(select(func.count(Article.id)))).scalar()
    
    return StandardResponse(
        message="Dashboard stats retrieved",
        data={
            "total_users": total_users,
            "total_projects": total_projects,
            "active_loans": active_loans,
            "pending_loans": pending_loans,
            "upcoming_events": upcoming_events,
            "total_articles": total_articles
        }
    )

@router.get("/users", response_model=StandardResponse)
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[UserRole] = None,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    query = select(User)
    if role:
        query = query.where(User.role == role)
        
    result = await db.execute(query.offset(offset).limit(limit))
    users = result.scalars().all()
    
    count_query = select(func.count(User.id))
    if role:
        count_query = count_query.where(User.role == role)
    total = (await db.execute(count_query)).scalar()
    pages = ceil(total / limit) if total > 0 else 0
    
    return StandardResponse(
        message="Users retrieved",
        data={
            "users": [UserResponse.model_validate(u) for u in users],
            "pagination": {"total": total, "page": page, "limit": limit, "pages": pages}
        }
    )

@router.put("/users/{id}/role", response_model=StandardResponse)
async def update_user_role(
    id: str,
    role_update: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    if str(current_user.id) == id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role_update.role
    await db.commit()
    await db.refresh(user)
    return StandardResponse(message="User role updated", data=UserResponse.model_validate(user))

@router.delete("/users/{id}", response_model=StandardResponse)
async def deactivate_user(
    id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    if str(current_user.id) == id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
        
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    await db.commit()
    return StandardResponse(message="User deactivated successfully")

@router.get("/loans", response_model=StandardResponse)
async def get_all_loans(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[LoanStatus] = None,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    query = select(HardwareLoan).options(
        selectinload(HardwareLoan.hardware),
        selectinload(HardwareLoan.borrower)
    )
    if status:
        query = query.where(HardwareLoan.status == status)
        
    result = await db.execute(query.offset(offset).limit(limit))
    loans = result.scalars().all()
    
    count_query = select(func.count(HardwareLoan.id))
    if status:
        count_query = count_query.where(HardwareLoan.status == status)
    total = (await db.execute(count_query)).scalar()
    pages = ceil(total / limit) if total > 0 else 0
    
    return StandardResponse(
        message="All loans retrieved",
        data={
            "loans": [LoanResponse.model_validate(l) for l in loans],
            "pagination": {"total": total, "page": page, "limit": limit, "pages": pages}
        }
    )

@router.put("/loans/{loan_id}/approve", response_model=StandardResponse)
async def approve_loan(
    loan_id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(HardwareLoan)
        .where(HardwareLoan.id == loan_id)
        .options(selectinload(HardwareLoan.hardware))
    )
    loan = result.scalars().first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    if loan.status != LoanStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending loans can be approved")
    
    if loan.hardware.available_quantity < 1:
        raise HTTPException(status_code=400, detail="Hardware not available in stock")
        
    loan.status = LoanStatus.APPROVED
    loan.approved_by_id = current_user.id
    loan.approval_date = datetime.utcnow()
    loan.hardware.available_quantity -= 1
    
    await db.commit()
    await db.refresh(loan)
    return StandardResponse(message="Loan approved", data=LoanResponse.model_validate(loan))

class RejectLoanRequest(BaseModel):
    reason: Optional[str] = None

@router.put("/loans/{loan_id}/reject", response_model=StandardResponse)
async def reject_loan(
    loan_id: str,
    reject_in: RejectLoanRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(HardwareLoan).where(HardwareLoan.id == loan_id))
    loan = result.scalars().first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
        
    if loan.status != LoanStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending loans can be rejected")
        
    loan.status = LoanStatus.REJECTED
    # Optional: we could store the reason in a new field if added to model
    
    await db.commit()
    await db.refresh(loan)
    return StandardResponse(message="Loan rejected", data=LoanResponse.model_validate(loan))

@router.get("/events/{id}/participants", response_model=StandardResponse)
async def get_event_participants(
    id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(EventRegistration)
        .where(EventRegistration.event_id == id)
        .options(selectinload(EventRegistration.student))
    )
    registrations = result.scalars().all()
    
    data = []
    for reg in registrations:
        item = EventRegistrationResponse.model_validate(reg).model_dump()
        item["user"] = UserResponse.model_validate(reg.student)
        data.append(item)
        
    return StandardResponse(message="Participants retrieved", data=data)
