from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
import uuid
from app.api import deps
from app.schemas.visit import VisitCreate, VisitUpdate, VisitResponse, VisitDetailResponse, VisitListResponse
from app.schemas.symptom import VisitSymptomCreate, VisitSymptomResponse, AnamnesisResponseCreate
from app.schemas.vital_sign import VitalSignCreate, VitalSignUpdate, VitalSignResponse, VitalSignValidationResponse
from app.schemas.ai_assessment import AIAssessmentResponse, RedFlagAlertResponse
from app.services import visit_service, ai_service, red_flag_service
from app.models import User

router = APIRouter()

@router.post("", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
async def create_visit(data: VisitCreate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await visit_service.create_visit(db, data, current_user.id, clinic_id=1) # Hardcoded clinic for MVP

@router.get("", response_model=VisitListResponse)
async def list_visits(pagination: deps.PaginationParams = Depends(), db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    visits = await visit_service.get_visits(db, filters={}, pagination=pagination.model_dump())
    return {"items": visits, "total": len(visits), "page": pagination.page, "size": pagination.size}

@router.get("/{id}")
async def get_visit(id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    visit = await visit_service.get_visit(db, id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    p = visit.patient
    patient_dict = {
        "id": str(p.id),
        "first_name": p.first_name,
        "last_name": p.last_name,
        "gender": p.gender,
        "date_of_birth": str(p.date_of_birth) if p.date_of_birth else None,
        "phone": p.phone,
        "national_id": p.national_id,
        "blood_type": p.blood_type,
        "village": {"name": p.village.name} if p.village else None,
    } if p else None

    vitals = visit.vital_signs
    vitals_dict = {
        "systolic_bp": vitals.systolic_bp,
        "diastolic_bp": vitals.diastolic_bp,
        "pulse": vitals.pulse,
        "temperature": vitals.temperature,
        "spo2": vitals.spo2,
        "respiratory_rate": vitals.respiratory_rate,
        "weight": vitals.weight,
        "height": vitals.height,
        "measured_at": str(vitals.measured_at) if vitals.measured_at else None,
    } if vitals else None

    ai = visit.ai_assessment
    ai_dict = {
        "id": str(ai.id),
        "risk_level": ai.risk_level,
        "risk_score": ai.risk_score,
        "confidence": ai.confidence,
        "potential_conditions": ai.potential_conditions,
        "risk_factors": ai.risk_factors,
        "model_name": ai.model_name,
    } if ai else None

    doc = visit.doctor_assessment
    doc_dict = {
        "id": str(doc.id),
        "clinical_notes": doc.clinical_notes,
        "treatment_plan": doc.treatment_plan,
        "recommendations": doc.recommendations,
        "ai_agreement": doc.ai_agreement,
    } if doc else None

    attachments = [{
        "id": str(a.id),
        "visit_id": str(a.visit_id),
        "file_name": a.file_name,
        "file_url": a.file_url,
        "file_type": a.file_type,
        "category": a.category,
        "title": a.title,
        "notes": a.notes,
        "created_at": str(a.created_at),
    } for a in (visit.attachments or [])]

    symptoms = [{
        "id": s.id,
        "symptom_id": s.symptom_id,
        "severity": s.severity,
        "duration_value": s.duration_value,
        "duration_unit": s.duration_unit,
        "symptom": {"name_uz": s.symptom.name_uz} if s.symptom else None,
    } for s in (visit.symptoms or [])]

    return {
        "id": str(visit.id),
        "patient_id": str(visit.patient_id),
        "nurse_id": str(visit.nurse_id) if visit.nurse_id else None,
        "clinic_id": visit.clinic_id,
        "visit_date": str(visit.visit_date),
        "chief_complaint": visit.chief_complaint,
        "status": visit.status,
        "risk_level": visit.risk_level,
        "urgency": visit.urgency,
        "notes": visit.notes,
        "patient_first_name": p.first_name if p else None,
        "patient_last_name": p.last_name if p else None,
        "patient": patient_dict,
        "vitals": vitals_dict,
        "vital_signs": vitals_dict,
        "ai_assessment": ai_dict,
        "doctor_assessment": doc_dict,
        "attachments": attachments,
        "symptoms": symptoms,
    }

@router.put("/{id}/status")
async def update_visit_status(id: uuid.UUID, visit_status: str, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    visit = await visit_service.update_visit_status(db, id, visit_status)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit

@router.post("/{id}/submit-to-doctor")
async def submit_to_doctor(id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await visit_service.submit_to_doctor(db, id)

@router.post("/{id}/symptoms", response_model=List[VisitSymptomResponse])
async def add_symptoms(id: uuid.UUID, data: List[VisitSymptomCreate], db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await visit_service.add_symptoms(db, id, data)

@router.post("/{id}/vitals", response_model=VitalSignResponse)
async def add_vitals(id: uuid.UUID, data: VitalSignCreate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await visit_service.add_vital_signs(db, id, data)

@router.put("/{id}/vitals", response_model=VitalSignResponse)
async def update_vitals(id: uuid.UUID, data: VitalSignUpdate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await visit_service.update_vital_signs(db, id, data)

@router.post("/{id}/anamnesis", response_model=List[Any])
async def save_anamnesis(id: uuid.UUID, data: List[AnamnesisResponseCreate], db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await visit_service.add_anamnesis(db, id, data)

@router.post("/{id}/check-red-flags", response_model=List[RedFlagAlertResponse])
async def check_red_flags(id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await red_flag_service.check_red_flags(db, id)

@router.post("/{id}/ai-assessment", response_model=AIAssessmentResponse)
async def run_ai_assessment(id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await ai_service.run_assessment(db, id)

@router.post("/quick-ai-assessment", response_model=AIAssessmentResponse)
async def quick_ai_assessment(data: dict):
    return await ai_service.run_quick_assessment(data)
