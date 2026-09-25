from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import date

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone: Optional[str] = None
    village_id: int
    address: Optional[str] = None
    national_id: Optional[str] = None
    blood_type: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    village_id: Optional[int] = None
    address: Optional[str] = None
    national_id: Optional[str] = None
    blood_type: Optional[str] = None

class PatientResponse(PatientBase):
    id: UUID
    patient_code: str
    village_name: Optional[str] = None
    age: int

    model_config = ConfigDict(from_attributes=True)

class PatientListResponse(BaseModel):
    items: list[PatientResponse]
    total: int
    page: int
    size: int

class PatientSearchParams(BaseModel):
    query: str
    village_id: Optional[int] = None
    gender: Optional[str] = None
