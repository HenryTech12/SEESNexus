from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from ..models.all_models import EventType, RegistrationStatus

class EventBase(BaseModel):
    title: str
    description: str
    event_type: EventType
    location: str
    is_virtual: bool = False
    virtual_link: Optional[str] = None
    banner_url: Optional[str] = None
    start_date: datetime
    end_date: datetime
    registration_deadline: datetime
    max_participants: Optional[int] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    location: Optional[str] = None
    is_virtual: Optional[bool] = None
    virtual_link: Optional[str] = None
    banner_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    max_participants: Optional[int] = None

class EventResponse(EventBase):
    id: UUID
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EventRegistrationResponse(BaseModel):
    id: UUID
    event_id: UUID
    student_id: UUID
    registered_at: datetime
    status: RegistrationStatus

    model_config = ConfigDict(from_attributes=True)
