from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
import uuid
from app.api import deps
from app.services import audit_service
from app.models import User

router = APIRouter()

@router.get("/users")
async def list_users(db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return []

@router.get("/audit-logs")
async def get_audit_logs(pagination: deps.PaginationParams = Depends(), db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await audit_service.get_audit_logs(db, {}, pagination.model_dump())
