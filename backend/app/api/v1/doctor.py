from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
import uuid
from app.api import deps
from app.schemas.visit import VisitResponse, VisitDetailResponse
from app.schemas.doctor_assessment import DoctorAssessmentCreate, DoctorAssessmentResponse, DiagnosisCreate, ReferralCreate, FollowUpCreate, PrescriptionCreate, MessageToNurse
from app.services import doctor_service, visit_service
from app.models import User

router = APIRouter()

@router.get("/queue", response_model=List[VisitDetailResponse])
async def get_queue(db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await visit_service.get_doctor_queue(db, current_user.id, {})

@router.post("/visits/{id}/doctor-assessment", response_model=DoctorAssessmentResponse)
async def create_assessment(id: uuid.UUID, data: DoctorAssessmentCreate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await doctor_service.create_assessment(db, id, current_user.id, data)

@router.post("/visits/{id}/diagnoses", response_model=Any)
async def add_diagnosis(id: uuid.UUID, data: DiagnosisCreate, assessment_id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await doctor_service.add_diagnosis(db, assessment_id, data)

@router.post("/visits/{id}/referral", response_model=Any)
async def add_referral(id: uuid.UUID, data: ReferralCreate, assessment_id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await doctor_service.create_referral(db, assessment_id, data)

@router.post("/visits/{id}/follow-up", response_model=Any)
async def add_follow_up(id: uuid.UUID, data: FollowUpCreate, assessment_id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await doctor_service.create_follow_up(db, assessment_id, data)

@router.post("/visits/{id}/prescriptions", response_model=Any)
async def add_prescription(id: uuid.UUID, data: PrescriptionCreate, assessment_id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await doctor_service.add_prescription(db, assessment_id, data)

@router.post("/visits/{id}/message-nurse")
async def message_nurse(id: uuid.UUID, data: MessageToNurse, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    await doctor_service.send_message_to_nurse(db, id, current_user.id, data.message)
    return {"status": "sent"}
