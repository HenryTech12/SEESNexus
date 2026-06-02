from typing import List, Optional
from datetime import datetime
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.all_models import Hardware, User, UserRole, HardwareLoan, LoanStatus, HardwareCategory, HardwareStatus
from app.schemas.hardware import HardwareCreate, HardwareUpdate, HardwareResponse
from app.schemas.loan import LoanCreate, LoanResponse
from app.schemas.response import StandardResponse
from app.middleware.auth_middleware import get_current_user, require_admin

router = APIRouter(prefix="/hardware", tags=["hardware"])

@router.get("/", response_model=StandardResponse)
async def get_hardware(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[HardwareCategory] = None,
    status: Optional[HardwareStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    query = select(Hardware)
    
    if category:
        query = query.where(Hardware.category == category)
    if status:
        query = query.where(Hardware.status == status)
        
    result = await db.execute(query.offset(offset).limit(limit))
    items = result.scalars().all()
    
    count_query = select(func.count(Hardware.id))
    if category:
        count_query = count_query.where(Hardware.category == category)
    if status:
        count_query = count_query.where(Hardware.status == status)
        
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    pages = ceil(total / limit) if total > 0 else 0

    return StandardResponse(
        message="Hardware retrieved",
        data={
            "hardware": [HardwareResponse.model_validate(h) for h in items],
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": pages
            }
        }
    )

@router.get("/{id}", response_model=StandardResponse)
async def get_hardware_item(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hardware).where(Hardware.id == id))
    hardware = result.scalars().first()
    if not hardware:
        raise HTTPException(status_code=404, detail="Hardware not found")
    
    loan_count_result = await db.execute(
        select(func.count(HardwareLoan.id)).where(HardwareLoan.hardware_id == id)
    )
    loan_history_count = loan_count_result.scalar()
    
    data = HardwareResponse.model_validate(hardware).model_dump()
    data["loan_history_count"] = loan_history_count
    
    return StandardResponse(message="Hardware item retrieved", data=data)

@router.post("/", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
async def add_hardware(
    item_in: HardwareCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    new_item = Hardware(
        **item_in.model_dump(),
        available_quantity=item_in.quantity,
        added_by_id=current_user.id
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    
    return StandardResponse(
        message="Hardware added successfully",
        data=HardwareResponse.model_validate(new_item)
    )

@router.put("/{id}", response_model=StandardResponse)
async def update_hardware(
    id: str,
    item_in: HardwareUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Hardware).where(Hardware.id == id))
    hardware = result.scalars().first()
    if not hardware:
        raise HTTPException(status_code=404, detail="Hardware not found")
    
    update_data = item_in.model_dump(exclude_unset=True)
    if "available_quantity" in update_data:
        del update_data["available_quantity"]
        
    for field, value in update_data.items():
        setattr(hardware, field, value)
    
    await db.commit()
    await db.refresh(hardware)
    return StandardResponse(message="Hardware updated", data=HardwareResponse.model_validate(hardware))

@router.delete("/{id}", response_model=StandardResponse)
async def delete_hardware(
    id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Hardware).where(Hardware.id == id))
    hardware = result.scalars().first()
    if not hardware:
        raise HTTPException(status_code=404, detail="Hardware not found")
    
    # Check for active loans (PENDING or APPROVED)
    loan_result = await db.execute(
        select(HardwareLoan).where(
            HardwareLoan.hardware_id == id,
            or_(HardwareLoan.status == LoanStatus.PENDING, HardwareLoan.status == LoanStatus.APPROVED)
        )
    )
    if loan_result.scalars().first():
        raise HTTPException(status_code=400, detail="Cannot delete hardware with active loans")
        
    await db.delete(hardware)
    await db.commit()
    return StandardResponse(message="Hardware deleted successfully")

@router.post("/{id}/loan", response_model=StandardResponse)
async def request_loan(
    id: str,
    loan_in: LoanCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Hardware).where(Hardware.id == id))
    hardware = result.scalars().first()
    if not hardware:
        raise HTTPException(status_code=404, detail="Hardware not found")
    
    if hardware.available_quantity < 1:
        raise HTTPException(status_code=400, detail="Hardware not available for loan")
    
    new_loan = HardwareLoan(
        hardware_id=hardware.id,
        borrower_id=current_user.id,
        purpose=loan_in.purpose,
        expected_return_date=loan_in.expected_return_date,
        status=LoanStatus.PENDING
    )
    
    db.add(new_loan)
    await db.commit()
    
    result = await db.execute(
        select(HardwareLoan)
        .where(HardwareLoan.id == new_loan.id)
        .options(selectinload(HardwareLoan.hardware))
    )
    new_loan = result.scalars().first()
    
    return StandardResponse(message="Loan request submitted", data=LoanResponse.model_validate(new_loan))

@router.get("/loans/my", response_model=StandardResponse)
async def get_my_loans(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HardwareLoan)
        .where(HardwareLoan.borrower_id == current_user.id)
        .options(selectinload(HardwareLoan.hardware))
    )
    loans = result.scalars().all()
    return StandardResponse(message="Your loans retrieved", data=[LoanResponse.model_validate(l) for l in loans])

@router.put("/loans/{loan_id}/return", response_model=StandardResponse)
async def return_hardware(
    loan_id: str,
    current_user: User = Depends(get_current_user),
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
    
    if loan.borrower_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if loan.status == LoanStatus.RETURNED:
        raise HTTPException(status_code=400, detail="Hardware already returned")
    
    loan.status = LoanStatus.RETURNED
    loan.actual_return_date = datetime.utcnow()
    loan.hardware.available_quantity += 1
    
    await db.commit()
    await db.refresh(loan)
    return StandardResponse(message="Hardware returned successfully", data=LoanResponse.model_validate(loan))
