from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from ..models.all_models import LoanStatus
from .user import UserResponse
from .hardware import HardwareResponse

class LoanBase(BaseModel):
    hardware_id: UUID
    purpose: str
    expected_return_date: datetime

class LoanCreate(LoanBase):
    pass

class LoanUpdate(BaseModel):
    status: Optional[LoanStatus] = None
    actual_return_date: Optional[datetime] = None

class LoanResponse(BaseModel):
    id: UUID
    hardware_id: UUID
    borrower_id: UUID
    approved_by_id: Optional[UUID] = None
    status: LoanStatus
    purpose: str
    request_date: datetime
    approval_date: Optional[datetime] = None
    expected_return_date: datetime
    actual_return_date: Optional[datetime] = None
    
    hardware: Optional[HardwareResponse] = None
    borrower: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
