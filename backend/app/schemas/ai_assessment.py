from pydantic import BaseModel, ConfigDict
from typing import List, Any, Dict
from datetime import datetime

class AIAssessmentResponse(BaseModel):
    risk_level: str
    risk_score: float
    confidence_note: str = 'Bu AI baholashidir, yakuniy tashxis emas.'
    potential_conditions: List[Dict[str, Any]]
    risk_factors: List[str]
    missing_data: List[str]

    model_config = ConfigDict(from_attributes=True)

class RedFlagAlertResponse(BaseModel):
    id: int
    rule_code: str
    rule_description: str
    severity: str
    triggered_values: Dict[str, Any]
    action_taken: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
