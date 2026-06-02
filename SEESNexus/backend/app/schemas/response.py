from typing import Optional, List, Any
from pydantic import BaseModel

class StandardResponse(BaseModel):
    status: str = "success"
    message: str
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    code: int
