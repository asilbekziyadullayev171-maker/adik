import uuid
from datetime import datetime
from sqlalchemy import String, Integer, SmallInteger, ForeignKey, func, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMPTZ
from app.database import Base

class VitalSign(Base):
    __tablename__ = "vital_signs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    visit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("visits.id"), unique=True, index=True)
    systolic_bp: Mapped[int | None] = mapped_column(SmallInteger)
    diastolic_bp: Mapped[int | None] = mapped_column(SmallInteger)
    pulse: Mapped[int | None] = mapped_column(SmallInteger)
    temperature: Mapped[float | None] = mapped_column(Numeric(4, 1))
    spo2: Mapped[int | None] = mapped_column(SmallInteger)
    respiratory_rate: Mapped[int | None] = mapped_column(SmallInteger)
    weight: Mapped[float | None] = mapped_column(Numeric(5, 1))
    height: Mapped[float | None] = mapped_column(Numeric(4, 1))
    measured_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now())
    measurement_method: Mapped[str] = mapped_column(String(20), default="manual")

    visit: Mapped["Visit"] = relationship("Visit", back_populates="vital_signs")
