import random
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from app.database import get_db
from app.models.all_models import VerificationCode
from app.utils.email import send_verification_email
from app.schemas.response import StandardResponse

router = APIRouter(prefix="/notify", tags=["notifications"])

class EmailVerifyRequest(BaseModel):
    email: EmailStr

class CodeVerifyRequest(BaseModel):
    email: EmailStr
    code: str

@router.post("/send-code", response_model=StandardResponse)
async def send_code(request: EmailVerifyRequest, db: AsyncSession = Depends(get_db)):
    # Generate 6-character alphanumeric uppercase code
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    # Mark old unused codes for this email as used
    await db.execute(
        update(VerificationCode)
        .where(VerificationCode.email == request.email, VerificationCode.is_used == False)
        .values(is_used=True)
    )
    
    # Store in database
    new_code = VerificationCode(
        email=request.email,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(new_code)
    await db.commit()
    
    # Send via Brevo email
    success = send_verification_email(request.email, code)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
    return StandardResponse(message="Verification code sent to email")

@router.post("/verify-code", response_model=StandardResponse)
async def verify_code(request: CodeVerifyRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(VerificationCode).where(
            VerificationCode.email == request.email,
            VerificationCode.code == request.code.upper(),
            VerificationCode.is_used == False,
            VerificationCode.expires_at > datetime.utcnow()
        )
    )
    code_record = result.scalars().first()
    
    if not code_record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # Mark as used
    code_record.is_used = True
    await db.commit()
    
    return StandardResponse(message="Email verified successfully")
