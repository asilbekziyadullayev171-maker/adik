from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class SymptomResponse(BaseModel):
    id: int
    code: str
    name_uz: str
    name_ru: str
    name_en: str
    category: str

    model_config = ConfigDict(from_attributes=True)

class VisitSymptomCreate(BaseModel):
    symptom_id: int
    severity: int
    duration_value: Optional[int] = None
    duration_unit: Optional[str] = None
    onset: Optional[str] = None
    frequency: Optional[str] = None
    additional_details: Optional[str] = None

class VisitSymptomResponse(VisitSymptomCreate):
    id: int
    visit_id: str

    model_config = ConfigDict(from_attributes=True)

class AnamnesisResponseCreate(BaseModel):
    symptom_code: str
    question_id: int
    question_text: str
    answer_type: str
    answer_value: str
