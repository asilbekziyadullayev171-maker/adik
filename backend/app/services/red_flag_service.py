from sqlalchemy.ext.asyncio import AsyncSession
from app.models import RedFlagAlert
import uuid

async def check_red_flags(db: AsyncSession, visit_id: uuid.UUID) -> list[RedFlagAlert]:
    return []
