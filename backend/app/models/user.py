import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, SmallInteger, ForeignKey, func, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMPTZ
from app.database import Base

class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    role_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("roles.id"), primary_key=True)
    assigned_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now())

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    
    users: Mapped[list["User"]] = relationship("User", secondary="user_roles", back_populates="roles")

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    last_login: Mapped[datetime | None] = mapped_column(TIMESTAMPTZ)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now(), onupdate=func.now())

    roles: Mapped[list[Role]] = relationship("Role", secondary="user_roles", back_populates="users")
    
    # Relationships for backref
    nurse_assignments: Mapped[list["NurseAssignment"]] = relationship("NurseAssignment", back_populates="user")
    created_patients: Mapped[list["Patient"]] = relationship("Patient", back_populates="creator", foreign_keys="[Patient.created_by]")
    nurse_visits: Mapped[list["Visit"]] = relationship("Visit", back_populates="nurse", foreign_keys="[Visit.nurse_id]")
    doctor_assessments: Mapped[list["DoctorAssessment"]] = relationship("DoctorAssessment", back_populates="doctor")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="user")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="user")
