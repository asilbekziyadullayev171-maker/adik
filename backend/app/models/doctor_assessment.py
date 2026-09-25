import uuid
from datetime import date, datetime
from sqlalchemy import String, Integer, ForeignKey, func, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMPTZ
from app.database import Base

class DoctorAssessment(Base):
    __tablename__ = "doctor_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("visits.id"), unique=True, index=True)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    clinical_notes: Mapped[str | None] = mapped_column(Text)
    ai_agreement: Mapped[str | None] = mapped_column(String(20))
    ai_disagreement_reason: Mapped[str | None] = mapped_column(Text)
    treatment_plan: Mapped[str | None] = mapped_column(Text)
    recommendations: Mapped[str | None] = mapped_column(Text)
    reviewed_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(TIMESTAMPTZ)

    visit: Mapped["Visit"] = relationship("Visit", back_populates="doctor_assessment")
    doctor: Mapped["User"] = relationship("User", back_populates="doctor_assessments", foreign_keys=[doctor_id])
    diagnoses: Mapped[list["Diagnosis"]] = relationship("Diagnosis", back_populates="doctor_assessment")
    referral: Mapped["Referral"] = relationship("Referral", back_populates="doctor_assessment", uselist=False)
    follow_ups: Mapped[list["FollowUp"]] = relationship("FollowUp", back_populates="doctor_assessment")
    prescriptions: Mapped[list["Prescription"]] = relationship("Prescription", back_populates="doctor_assessment")

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    doctor_assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_assessments.id"))
    icd10_code: Mapped[str | None] = mapped_column(String(10))
    diagnosis_text: Mapped[str] = mapped_column(Text, nullable=False)
    diagnosis_type: Mapped[str] = mapped_column(String(20), nullable=False)
    certainty: Mapped[str | None] = mapped_column(String(20))

    doctor_assessment: Mapped[DoctorAssessment] = relationship("DoctorAssessment", back_populates="diagnoses")

class Referral(Base):
    __tablename__ = "referrals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_assessments.id"))
    referred_to: Mapped[str] = mapped_column(String(200), nullable=False)
    referral_reason: Mapped[str] = mapped_column(Text, nullable=False)
    urgency: Mapped[str] = mapped_column(String(20), nullable=False)
    specialty: Mapped[str | None] = mapped_column(String(100))
    referral_date: Mapped[date] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    outcome: Mapped[str | None] = mapped_column(Text)

    doctor_assessment: Mapped[DoctorAssessment] = relationship("DoctorAssessment", back_populates="referral")

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    doctor_assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_assessments.id"))
    scheduled_date: Mapped[date] = mapped_column(nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    instructions: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="scheduled")
    completed_visit_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("visits.id"))

    doctor_assessment: Mapped[DoctorAssessment] = relationship("DoctorAssessment", back_populates="follow_ups")
    completed_visit: Mapped["Visit"] = relationship("Visit", foreign_keys=[completed_visit_id])

class Prescription(Base):
    __tablename__ = "prescriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    doctor_assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_assessments.id"))
    medication_name: Mapped[str] = mapped_column(String(200), nullable=False)
    dosage: Mapped[str] = mapped_column(String(100), nullable=False)
    frequency: Mapped[str] = mapped_column(String(100), nullable=False)
    duration: Mapped[str | None] = mapped_column(String(100))
    instructions: Mapped[str | None] = mapped_column(Text)

    doctor_assessment: Mapped[DoctorAssessment] = relationship("DoctorAssessment", back_populates="prescriptions")
