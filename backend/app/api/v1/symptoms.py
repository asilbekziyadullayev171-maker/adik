from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
from app.api import deps
from app.schemas.symptom import SymptomResponse
from app.models import User

router = APIRouter()

@router.get("", response_model=List[SymptomResponse])
async def list_symptoms(db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    # MVP: Mock returning symptoms, actual implementation queries DB
    return []

@router.get("/{code}/questionnaire")
async def get_symptom_questionnaire(code: str, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    return []
