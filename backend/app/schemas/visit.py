from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, List, Any
from datetime import datetime

class VisitCreate(BaseModel):
    patient_id: UUID
    chief_complaint: str
    notes: Optional[str] = None

class VisitUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    notes: Optional[str] = None

class VisitResponse(BaseModel):
    id: UUID
    patient_id: UUID
    nurse_id: Optional[UUID] = None
    clinic_id: Optional[int] = None
    visit_date: datetime
    chief_complaint: str
    status: str
    risk_level: Optional[str] = None
    urgency: Optional[int] = None
    notes: Optional[str] = None
    patient_first_name: Optional[str] = None
    patient_last_name: Optional[str] = None
    symptom_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class VisitDetailResponse(VisitResponse):
    patient: Any = None
    symptoms: List[Any] = []
    vitals: Any = None
    medical_history: List[Any] = []
    ai_assessment: Any = None
    doctor_assessment: Any = None
    red_flags: List[Any] = []
    lab_results: List[Any] = []
    anamnesis: List[Any] = []
    attachments: List[Any] = []

    model_config = ConfigDict(from_attributes=True)

class VisitListResponse(BaseModel):
    items: List[VisitResponse]
    total: int
    page: int
    size: int
