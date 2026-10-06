from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
from app.api import deps
from app.schemas.symptom import SymptomResponse
from app.models import User

router = APIRouter()

import json
import os
from sqlalchemy import select
from app.models import Symptom

@router.get("", response_model=List[SymptomResponse])
async def list_symptoms(db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    stmt = select(Symptom).order_by(Symptom.id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{code}/questionnaire")
async def get_symptom_questionnaire(code: str, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    q_path = os.path.join(r"d:\shifonuri\ai-service\data\questionnaires", f"{code}.json")
    if os.path.exists(q_path):
        with open(q_path, "r", encoding="utf-8") as fp:
            return json.load(fp)
    return {"symptom_code": code, "questions": []}
