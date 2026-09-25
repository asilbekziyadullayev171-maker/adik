from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
from app.api import deps
from app.services import notification_service
from app.models import User

router = APIRouter()

@router.get("", response_model=List[Any])
async def list_notifications(unread_only: bool = False, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await notification_service.get_notifications(db, current_user.id, unread_only)

@router.put("/{id}/read")
async def mark_read(id: int, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    notif = await notification_service.mark_as_read(db, id, current_user.id)
    return {"status": "ok", "read": bool(notif)}

@router.get("/unread-count")
async def get_unread_count(db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    count = await notification_service.get_unread_count(db, current_user.id)
    return {"count": count}
