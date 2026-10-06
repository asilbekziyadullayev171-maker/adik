from sqlalchemy import DateTime
TIMESTAMP = DateTime(timezone=True)
TIMESTAMPTZ = DateTime(timezone=True)
from sqlalchemy import DateTime
TIMESTAMPTZ = DateTime(timezone=True)
import uuid
from datetime import datetime
from sqlalchemy import String, BigInteger, ForeignKey, func, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    resource_id: Mapped[str] = mapped_column(String(50), nullable=False)
    details: Mapped[dict | list | None] = mapped_column(JSONB)
    ip_address: Mapped[str | None] = mapped_column(INET)
    user_agent: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), index=True)

    user: Mapped["User"] = relationship("User", back_populates="audit_logs")

class SyncQueue(Base):
    __tablename__ = "sync_queue"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    device_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_local_id: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_server_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    operation: Mapped[str] = mapped_column(String(10), nullable=False)
    payload: Mapped[dict | list] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    conflict_details: Mapped[dict | list | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    synced_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)

    user: Mapped["User"] = relationship("User")
