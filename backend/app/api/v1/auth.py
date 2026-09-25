from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, ChangePasswordRequest, UserResponse
from app.services import auth_service
from app.core.exceptions import UnauthorizedException
from app.models import User

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(deps.get_db)):
    user = await auth_service.authenticate_user(db, data.phone, data.password)
    if not user:
        raise UnauthorizedException("Incorrect phone or password")
    return await auth_service.create_user_tokens(user)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(deps.get_db)):
    return await auth_service.refresh_access_token(db, data.refresh_token)

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: User = Depends(deps.get_current_user)):
    # In a full implementation, revoke token in Redis
    pass

@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(data: ChangePasswordRequest, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    await auth_service.change_password(db, current_user, data.old_password, data.new_password)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(deps.get_current_active_user)):
    return current_user
