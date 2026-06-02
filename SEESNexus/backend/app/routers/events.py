from datetime import datetime
from typing import List, Optional
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.all_models import Event, User, EventRegistration, RegistrationStatus, EventType
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventRegistrationResponse
from app.schemas.user import UserResponse
from app.schemas.response import StandardResponse
from app.middleware.auth_middleware import get_current_user, require_admin

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=StandardResponse)
async def get_events(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    event_type: Optional[EventType] = None,
    upcoming_only: bool = False,
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    query = select(Event)
    
    if event_type:
        query = query.where(Event.event_type == event_type)
    if upcoming_only:
        query = query.where(Event.start_date > datetime.utcnow())
        
    result = await db.execute(query.offset(offset).limit(limit))
    events = result.scalars().all()
    
    count_query = select(func.count(Event.id))
    if event_type:
        count_query = count_query.where(Event.event_type == event_type)
    if upcoming_only:
        count_query = count_query.where(Event.start_date > datetime.utcnow())
        
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    pages = ceil(total / limit) if total > 0 else 0

    return StandardResponse(
        message="Events retrieved",
        data={
            "events": [EventResponse.model_validate(e) for e in events],
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": pages
            }
        }
    )

@router.get("/{id}", response_model=StandardResponse)
async def get_event(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == id))
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return StandardResponse(message="Event retrieved", data=EventResponse.model_validate(event))

@router.post("/", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_in: EventCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    new_event = Event(
        **event_in.model_dump(),
        created_by_id=current_user.id
    )
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    
    return StandardResponse(
        message="Event created successfully",
        data=EventResponse.model_validate(new_event)
    )

@router.put("/{id}", response_model=StandardResponse)
async def update_event(
    id: str,
    event_in: EventUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Event).where(Event.id == id))
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    for field, value in event_in.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    
    await db.commit()
    await db.refresh(event)
    return StandardResponse(message="Event updated", data=EventResponse.model_validate(event))

@router.delete("/{id}", response_model=StandardResponse)
async def delete_event(
    id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Event).where(Event.id == id))
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    await db.delete(event)
    await db.commit()
    return StandardResponse(message="Event deleted successfully")

@router.post("/{id}/register", response_model=StandardResponse)
async def register_for_event(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Event).where(Event.id == id))
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.registration_deadline < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Registration deadline has passed")
    
    # Check if already registered
    reg_result = await db.execute(
        select(EventRegistration).where(
            EventRegistration.event_id == id,
            EventRegistration.student_id == current_user.id
        )
    )
    if reg_result.scalars().first():
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Check max participants
    status_reg = RegistrationStatus.CONFIRMED
    if event.max_participants:
        count_result = await db.execute(
            select(func.count(EventRegistration.id)).where(
                EventRegistration.event_id == id,
                EventRegistration.status == RegistrationStatus.CONFIRMED
            )
        )
        current_registrations = count_result.scalar()
        if current_registrations >= event.max_participants:
            status_reg = RegistrationStatus.WAITLISTED
            
    new_reg = EventRegistration(
        event_id=event.id,
        student_id=current_user.id,
        status=status_reg
    )
    
    db.add(new_reg)
    await db.commit()
    await db.refresh(new_reg)
    
    message = "Registered successfully" if status_reg == RegistrationStatus.CONFIRMED else "Waitlisted successfully"
    return StandardResponse(message=message, data=EventRegistrationResponse.model_validate(new_reg))

@router.get("/{id}/participants", response_model=StandardResponse)
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
