from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from app.database import get_db
from app.models.all_models import User, UserRole
from app.schemas.user import UserCreate, UserResponse, Token, UserUpdate
from app.schemas.response import StandardResponse
from app.utils.hashing import get_password_hash, verify_password
from app.utils.jwt import create_access_token, create_refresh_token, verify_token
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password=hashed_pw,
        department=user_in.department,
        level=user_in.level,
        role=UserRole.STUDENT # Default role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return StandardResponse(
        message="Registration successful",
        data=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=StandardResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"user_id": str(user.id), "email": user.email, "role": user.role.value})
    refresh_token = create_refresh_token(data={"user_id": str(user.id)})
    
    return StandardResponse(
        message="Login successful",
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user)
        }
    )

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=StandardResponse)
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    payload = verify_token(body.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("user_id")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    access_token = create_access_token(data={"user_id": str(user.id), "email": user.email, "role": user.role.value})
    
    return StandardResponse(
        message="Token refreshed",
        data={"access_token": access_token, "token_type": "bearer"}
    )

@router.get("/validate/token", response_model=StandardResponse)
async def validate_token(current_user: User = Depends(get_current_user)):
    return StandardResponse(
        message="Token is valid",
        data={"valid": True, "user": UserResponse.model_validate(current_user)}
    )

@router.get("/me", response_model=StandardResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return StandardResponse(
        message="User profile retrieved",
        data=UserResponse.model_validate(current_user)
    )

@router.put("/me", response_model=StandardResponse)
async def update_me(user_in: UserUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    for field, value in user_in.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    return StandardResponse(message="Profile updated", data=UserResponse.model_validate(current_user))
