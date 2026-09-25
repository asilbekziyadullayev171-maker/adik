import uuid
from datetime import date, datetime
from sqlalchemy import String, Boolean, Integer, ForeignKey, func, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMPTZ
from app.database import Base

class MedicalHistory(Base):
    __tablename__ = "medical_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    onset_date: Mapped[date | None] = mapped_column()
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    recorded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    recorded_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now())

    patient: Mapped["Patient"] = relationship("Patient", back_populates="medical_histories")
    recorder: Mapped["User"] = relationship("User", foreign_keys=[recorded_by])

class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    dosage: Mapped[str | None] = mapped_column(String(100))
    frequency: Mapped[str | None] = mapped_column(String(100))
    start_date: Mapped[date | None] = mapped_column()
    end_date: Mapped[date | None] = mapped_column()
    prescribed_by: Mapped[str | None] = mapped_column(String(200))
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    recorded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    patient: Mapped["Patient"] = relationship("Patient", back_populates="medications")
    recorder: Mapped["User"] = relationship("User", foreign_keys=[recorded_by])

class Allergy(Base):
    __tablename__ = "allergies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"))
    allergen: Mapped[str] = mapped_column(String(200), nullable=False)
    allergy_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str | None] = mapped_column(String(20))
    reaction: Mapped[str | None] = mapped_column(Text)
    recorded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    patient: Mapped["Patient"] = relationship("Patient", back_populates="allergies")
    recorder: Mapped["User"] = relationship("User", foreign_keys=[recorded_by])

class LabResult(Base):
    __tablename__ = "lab_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    visit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("visits.id"))
    test_name: Mapped[str] = mapped_column(String(200), nullable=False)
    test_code: Mapped[str | None] = mapped_column(String(50))
    result_value: Mapped[str] = mapped_column(String(100), nullable=False)
    result_unit: Mapped[str | None] = mapped_column(String(50))
    reference_range: Mapped[str | None] = mapped_column(String(100))
    is_abnormal: Mapped[bool | None] = mapped_column(Boolean)
    performed_at: Mapped[datetime | None] = mapped_column(TIMESTAMPTZ)
    recorded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    visit: Mapped["Visit"] = relationship("Visit", back_populates="lab_results")
    recorder: Mapped["User"] = relationship("User", foreign_keys=[recorded_by])
