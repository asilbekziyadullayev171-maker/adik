from sqlalchemy import DateTime
TIMESTAMP = DateTime(timezone=True)
TIMESTAMPTZ = DateTime(timezone=True)
from sqlalchemy import DateTime
TIMESTAMPTZ = DateTime(timezone=True)
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, func, Text, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("visits.id"), unique=True, index=True)
    risk_level: Mapped[str] = mapped_column(String(15), nullable=False, index=True)
    risk_score: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    confidence: Mapped[float | None] = mapped_column(Numeric(5, 4))
    potential_conditions: Mapped[dict | list] = mapped_column(JSONB, nullable=False)
    risk_factors: Mapped[dict | list] = mapped_column(JSONB, nullable=False)
    missing_data: Mapped[dict | list | None] = mapped_column(JSONB)
    model_name: Mapped[str] = mapped_column(String(50), nullable=False)
    model_version: Mapped[str] = mapped_column(String(20), nullable=False)
    input_features: Mapped[dict | list | None] = mapped_column(JSONB)
    inference_time_ms: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())

    visit: Mapped["Visit"] = relationship("Visit", back_populates="ai_assessment")

class RedFlagAlert(Base):
    __tablename__ = "red_flag_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    visit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("visits.id"), index=True)
    rule_code: Mapped[str] = mapped_column(String(50), nullable=False)
    rule_description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    triggered_values: Mapped[dict | list] = mapped_column(JSONB, nullable=False)
    action_taken: Mapped[str | None] = mapped_column(Text)
    acknowledged_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    acknowledged_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())

    visit: Mapped["Visit"] = relationship("Visit", back_populates="red_flag_alerts")
    acknowledger: Mapped["User"] = relationship("User", foreign_keys=[acknowledged_by])
