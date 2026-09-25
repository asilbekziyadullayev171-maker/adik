from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import AuditLog
import uuid
from typing import Optional

async def log_action(db: AsyncSession, user_id: uuid.UUID, action: str, resource_type: str, resource_id: str, details: Optional[dict] = None, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log

async def get_audit_logs(db: AsyncSession, filters: dict, pagination: dict) -> list[AuditLog]:
    query = select(AuditLog)
    page = pagination.get("page", 1)
    size = pagination.get("size", 20)
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    return list(result.scalars().all())
