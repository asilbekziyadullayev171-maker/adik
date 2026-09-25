from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class VitalSignCreate(BaseModel):
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    pulse: Optional[int] = None
    temperature: Optional[float] = None
    spo2: Optional[int] = None
    respiratory_rate: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None

class VitalSignUpdate(VitalSignCreate):
    pass

class VitalSignResponse(VitalSignCreate):
    id: int
    visit_id: str
    map_value: Optional[float] = None
    pulse_pressure: Optional[int] = None
    shock_index: Optional[float] = None
    bmi: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class VitalSignValidationResponse(BaseModel):
    is_valid: bool
    errors: List[str]
    warnings: List[str]
