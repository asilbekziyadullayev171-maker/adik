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

@router.get("/{id}", response_model=VisitDetailResponse)
async def get_visit(id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    visit = await visit_service.get_visit(db, id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit

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
