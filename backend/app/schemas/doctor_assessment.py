from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, List
from datetime import date, datetime

class DoctorAssessmentCreate(BaseModel):
    clinical_notes: Optional[str] = None
    ai_agreement: Optional[bool] = None
    ai_disagreement_reason: Optional[str] = None
    treatment_plan: Optional[str] = None
    recommendations: Optional[str] = None

class DiagnosisCreate(BaseModel):
    icd10_code: Optional[str] = None
    diagnosis_text: str
    diagnosis_type: str
    certainty: Optional[str] = None

class ReferralCreate(BaseModel):
    referred_to: str
    referral_reason: str
    urgency: str
    specialty: Optional[str] = None
    referral_date: date

class FollowUpCreate(BaseModel):
    scheduled_date: date
    reason: str
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    duration: Optional[int] = None
    instructions: Optional[str] = None

class DoctorAssessmentResponse(DoctorAssessmentCreate):
    id: UUID
    visit_id: UUID
    doctor_id: UUID
    reviewed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    diagnoses: List[Any] = []
    referrals: List[Any] = []
    follow_ups: List[Any] = []
    prescriptions: List[Any] = []

    model_config = ConfigDict(from_attributes=True)

class MessageToNurse(BaseModel):
    message: str
