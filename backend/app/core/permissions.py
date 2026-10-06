from typing import List, Callable
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException, NotFoundException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

import uuid

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    try:
        payload = decode_token(token)
        sub: str = payload.get("sub")
        if sub is None:
            raise UnauthorizedException(detail="Could not validate credentials")
    except ValueError:
        raise UnauthorizedException(detail="Could not validate credentials")
    
    try:
        user_uuid = uuid.UUID(sub)
        stmt = select(User).options(selectinload(User.roles)).where(User.id == user_uuid)
    except (ValueError, AttributeError):
        stmt = select(User).options(selectinload(User.roles)).where(User.phone == sub)
        
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user is None:
        raise UnauthorizedException(detail="User not found")
        
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise UnauthorizedException(detail="Inactive user")
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_active_user)) -> User:
        user_roles = [role.name for role in user.roles]
        for allowed_role in self.allowed_roles:
            if allowed_role in user_roles:
                return user
        raise ForbiddenException(detail="Operation not permitted for this role")

def require_role(*roles: str) -> Callable:
    return RoleChecker(list(roles))

# Data isolation helpers
def filter_by_nurse_clinic(query, user: User, entity_model):
    """Filter queries so nurses only see patients/visits from their assigned clinics"""
    # Assuming the entity_model has clinic_id or similar. 
    # This is a placeholder for actual implementation based on the specific query structure.
    # E.g., query = query.where(entity_model.clinic_id.in_([ca.clinic_id for ca in user.nurse_assignments]))
    return query

def filter_by_doctor_patients(query, user: User, entity_model):
    """Filter queries so doctors only see relevant patients/visits"""
    # Placeholder for actual logic
    return query
