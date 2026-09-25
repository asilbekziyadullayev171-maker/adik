from typing import Dict, Any, List
from pydantic import BaseModel

class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []

def validate_bp(systolic: int | None, diastolic: int | None, result: ValidationResult):
    if systolic is not None:
        if not (50 <= systolic <= 250):
            result.errors.append(f"Systolic BP {systolic} is outside physical limits (50-250)")
        elif not (90 <= systolic <= 180):
            result.warnings.append(f"Systolic BP {systolic} is outside normal clinical limits (90-180)")
            
    if diastolic is not None:
        if not (30 <= diastolic <= 150):
            result.errors.append(f"Diastolic BP {diastolic} is outside physical limits (30-150)")
        elif not (60 <= diastolic <= 110):
            result.warnings.append(f"Diastolic BP {diastolic} is outside normal clinical limits (60-110)")
            
    if systolic is not None and diastolic is not None:
        if systolic <= diastolic:
            result.errors.append("Systolic BP must be greater than Diastolic BP")

def validate_pulse(pulse: int | None, result: ValidationResult):
    if pulse is not None:
        if not (30 <= pulse <= 250):
            result.errors.append(f"Pulse {pulse} is outside physical limits (30-250)")
        elif not (50 <= pulse <= 120):
            result.warnings.append(f"Pulse {pulse} is outside normal clinical limits (50-120)")

def validate_temperature(temp: float | None, result: ValidationResult):
    if temp is not None:
        if not (30.0 <= temp <= 45.0):
            result.errors.append(f"Temperature {temp} is outside physical limits (30.0-45.0)")
        elif not (35.5 <= temp <= 39.5):
            result.warnings.append(f"Temperature {temp} is outside normal clinical limits (35.5-39.5)")

def validate_spo2(spo2: int | None, result: ValidationResult):
    if spo2 is not None:
        if not (0 <= spo2 <= 100):
            result.errors.append(f"SpO2 {spo2} is outside possible limits (0-100)")
        elif not (90 <= spo2 <= 100):
            result.warnings.append(f"SpO2 {spo2} is outside normal clinical limits (90-100)")

def validate_respiratory_rate(rr: int | None, result: ValidationResult):
    if rr is not None:
        if not (5 <= rr <= 60):
            result.errors.append(f"Respiratory rate {rr} is outside physical limits (5-60)")
        elif not (12 <= rr <= 30):
            result.warnings.append(f"Respiratory rate {rr} is outside normal clinical limits (12-30)")

def validate_vital_signs(data: Dict[str, Any]) -> ValidationResult:
    result = ValidationResult(is_valid=True)
    
    validate_bp(data.get('systolic_bp'), data.get('diastolic_bp'), result)
    validate_pulse(data.get('pulse'), result)
    validate_temperature(data.get('temperature'), result)
    validate_spo2(data.get('spo2'), result)
    validate_respiratory_rate(data.get('respiratory_rate'), result)
    
    if len(result.errors) > 0:
        result.is_valid = False
        
    return result
