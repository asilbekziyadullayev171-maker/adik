import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, SmallInteger, ForeignKey, func, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMPTZ
from app.database import Base

class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    nurse_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    clinic_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("clinics.id"))
    visit_date: Mapped[datetime] = mapped_column(TIMESTAMPTZ, nullable=False, server_default=func.now(), index=True)
    chief_complaint: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="in_progress", index=True)
    risk_level: Mapped[str | None] = mapped_column(String(15), index=True)
    urgency: Mapped[int] = mapped_column(SmallInteger, default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    is_synced: Mapped[bool] = mapped_column(Boolean, default=False)
    local_id: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now(), onupdate=func.now())

    patient: Mapped["Patient"] = relationship("Patient", back_populates="visits")
    nurse: Mapped["User"] = relationship("User", back_populates="nurse_visits", foreign_keys=[nurse_id])
    clinic: Mapped["Clinic"] = relationship("Clinic", back_populates="visits")
    symptoms: Mapped[list["VisitSymptom"]] = relationship("VisitSymptom", back_populates="visit")
    vital_signs: Mapped["VitalSign"] = relationship("VitalSign", back_populates="visit", uselist=False)
    ai_assessment: Mapped["AIAssessment"] = relationship("AIAssessment", back_populates="visit", uselist=False)
    doctor_assessment: Mapped["DoctorAssessment"] = relationship("DoctorAssessment", back_populates="visit", uselist=False)
    red_flag_alerts: Mapped[list["RedFlagAlert"]] = relationship("RedFlagAlert", back_populates="visit")
    lab_results: Mapped[list["LabResult"]] = relationship("LabResult", back_populates="visit")
    anamnesis_responses: Mapped[list["AnamnesisResponse"]] = relationship("AnamnesisResponse", back_populates="visit")


class Symptom(Base):
    __tablename__ = "symptoms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    name_uz: Mapped[str] = mapped_column(String(200), nullable=False)
    name_ru: Mapped[str | None] = mapped_column(String(200))
    name_en: Mapped[str | None] = mapped_column(String(200))
    category: Mapped[str | None] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    visit_symptoms: Mapped[list["VisitSymptom"]] = relationship("VisitSymptom", back_populates="symptom")

class VisitSymptom(Base):
    __tablename__ = "visit_symptoms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    visit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("visits.id"), index=True)
    symptom_id: Mapped[int] = mapped_column(Integer, ForeignKey("symptoms.id"))
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    duration_value: Mapped[int | None] = mapped_column(Integer)
    duration_unit: Mapped[str | None] = mapped_column(String(20))
    onset: Mapped[str | None] = mapped_column(String(30))
    frequency: Mapped[str | None] = mapped_column(String(30))
    additional_details: Mapped[str | None] = mapped_column(Text)

    visit: Mapped[Visit] = relationship("Visit", back_populates="symptoms")
    symptom: Mapped[Symptom] = relationship("Symptom", back_populates="visit_symptoms")

class AnamnesisResponse(Base):
    __tablename__ = "anamnesis_responses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    visit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("visits.id"), index=True)
    symptom_code: Mapped[str] = mapped_column(String(30), nullable=False)
    question_id: Mapped[str] = mapped_column(String(50), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    answer_type: Mapped[str] = mapped_column(String(20), nullable=False)
    answer_value: Mapped[str] = mapped_column(Text, nullable=False)

    visit: Mapped[Visit] = relationship("Visit", back_populates="anamnesis_responses")
