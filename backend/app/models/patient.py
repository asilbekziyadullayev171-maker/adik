import uuid
from datetime import date, datetime
from sqlalchemy import String, Boolean, Integer, ForeignKey, func, Text, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMPTZ
from app.database import Base

class District(Base):
    __tablename__ = "districts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False)

    villages: Mapped[list["Village"]] = relationship("Village", back_populates="district")
    clinics: Mapped[list["Clinic"]] = relationship("Clinic", back_populates="district")

class Village(Base):
    __tablename__ = "villages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    district_id: Mapped[int] = mapped_column(Integer, ForeignKey("districts.id"), index=True)
    population: Mapped[int | None] = mapped_column(Integer)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 7))
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7))

    district: Mapped[District] = relationship("District", back_populates="villages")
    clinics: Mapped[list["Clinic"]] = relationship("Clinic", secondary="clinic_villages", back_populates="villages")
    patients: Mapped[list["Patient"]] = relationship("Patient", back_populates="village")

class ClinicVillage(Base):
    __tablename__ = "clinic_villages"

    clinic_id: Mapped[int] = mapped_column(Integer, ForeignKey("clinics.id"), primary_key=True)
    village_id: Mapped[int] = mapped_column(Integer, ForeignKey("villages.id"), primary_key=True)

class Clinic(Base):
    __tablename__ = "clinics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    clinic_type: Mapped[str] = mapped_column(String(50), nullable=False)
    district_id: Mapped[int] = mapped_column(Integer, ForeignKey("districts.id"))
    address: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    district: Mapped[District] = relationship("District", back_populates="clinics")
    villages: Mapped[list[Village]] = relationship("Village", secondary="clinic_villages", back_populates="clinics")
    nurse_assignments: Mapped[list["NurseAssignment"]] = relationship("NurseAssignment", back_populates="clinic")
    visits: Mapped[list["Visit"]] = relationship("Visit", back_populates="clinic")

class NurseAssignment(Base):
    __tablename__ = "nurse_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    clinic_id: Mapped[int] = mapped_column(Integer, ForeignKey("clinics.id"))
    assigned_from: Mapped[date] = mapped_column(nullable=False)
    assigned_to: Mapped[date | None] = mapped_column()

    user: Mapped["User"] = relationship("User", back_populates="nurse_assignments")
    clinic: Mapped[Clinic] = relationship("Clinic", back_populates="nurse_assignments")

class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    date_of_birth: Mapped[date] = mapped_column(nullable=False, index=True)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    village_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("villages.id"), index=True)
    address: Mapped[str | None] = mapped_column(Text)
    national_id: Mapped[str | None] = mapped_column(String(20), unique=True)
    blood_type: Mapped[str | None] = mapped_column(String(5))
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now(), onupdate=func.now())

    village: Mapped[Village | None] = relationship("Village", back_populates="patients")
    creator: Mapped["User"] = relationship("User", back_populates="created_patients", foreign_keys=[created_by])
    visits: Mapped[list["Visit"]] = relationship("Visit", back_populates="patient")
    medical_histories: Mapped[list["MedicalHistory"]] = relationship("MedicalHistory", back_populates="patient")
    medications: Mapped[list["Medication"]] = relationship("Medication", back_populates="patient")
    allergies: Mapped[list["Allergy"]] = relationship("Allergy", back_populates="patient")
