from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from ..models.all_models import HardwareCategory, HardwareStatus

class HardwareBase(BaseModel):
    name: str
    description: Optional[str] = None
    serial_number: str
    category: HardwareCategory
    status: HardwareStatus = HardwareStatus.AVAILABLE
    image_url: Optional[str] = None
    quantity: int = 1
    available_quantity: int = 1

class HardwareCreate(HardwareBase):
    pass

class HardwareUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    serial_number: Optional[str] = None
    category: Optional[HardwareCategory] = None
    status: Optional[HardwareStatus] = None
    image_url: Optional[str] = None
    quantity: Optional[int] = None
    available_quantity: Optional[int] = None

class HardwareResponse(HardwareBase):
    id: UUID
    added_by_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
