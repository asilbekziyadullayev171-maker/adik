from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.api import deps
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse, PatientListResponse
from app.services import patient_service
from app.models import User
from app.core.permissions import RoleChecker

router = APIRouter()

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(data: PatientCreate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    # Should check roles in real scenario
    return await patient_service.create_patient(db, data, current_user.id)

@router.get("", response_model=PatientListResponse)
async def list_patients(pagination: deps.PaginationParams = Depends(), db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    patients = await patient_service.get_patients(db, filters={}, pagination=pagination.model_dump())
    return {"items": patients, "total": len(patients), "page": pagination.page, "size": pagination.size}

@router.get("/search", response_model=List[PatientResponse])
async def search_patients(query: str, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await patient_service.search_patients(db, query)

@router.get("/check-duplicate", response_model=bool)
async def check_duplicate(first_name: str, last_name: str, date_of_birth: str, village_id: int, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    existing = await patient_service.check_duplicate(db, first_name, last_name, date_of_birth, village_id)
    return existing is not None

@router.get("/{id}", response_model=PatientResponse)
async def get_patient(id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    patient = await patient_service.get_patient(db, id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{id}", response_model=PatientResponse)
async def update_patient(id: uuid.UUID, data: PatientUpdate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    patient = await patient_service.update_patient(db, id, data)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/{id}/history")
async def get_patient_history(id: uuid.UUID, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return await patient_service.get_patient_history(db, id)
