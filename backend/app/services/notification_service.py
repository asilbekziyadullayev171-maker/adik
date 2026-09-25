from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Notification
import uuid

async def create_notification(db: AsyncSession, user_id: uuid.UUID, type: str, title: str, body: str, reference_type: str = None, reference_id: str = None) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        reference_type=reference_type,
        reference_id=reference_id
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif

async def get_notifications(db: AsyncSession, user_id: uuid.UUID, unread_only: bool = False) -> list[Notification]:
    query = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        query = query.where(Notification.is_read == False)
    result = await db.execute(query)
    return list(result.scalars().all())

async def mark_as_read(db: AsyncSession, notification_id: int, user_id: uuid.UUID) -> Notification | None:
    result = await db.execute(select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id))
    notif = result.scalars().first()
    if notif:
        notif.is_read = True
        await db.commit()
        await db.refresh(notif)
    return notif

async def get_unread_count(db: AsyncSession, user_id: uuid.UUID) -> int:
    result = await db.execute(select(Notification).where(Notification.user_id == user_id, Notification.is_read == False))
    return len(result.scalars().all())

async def notify_doctor_urgent(db: AsyncSession, visit_id: uuid.UUID):
    pass

async def notify_nurse_response(db: AsyncSession, visit_id: uuid.UUID, message: str):
    pass
