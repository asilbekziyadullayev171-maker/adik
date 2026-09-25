from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.core.permissions import get_current_user, get_current_active_user, RoleChecker
from pydantic import BaseModel

class PaginationParams(BaseModel):
    page: int = 1
    size: int = 20

class SortParams(BaseModel):
    sort_by: str = "created_at"
    sort_desc: bool = True
