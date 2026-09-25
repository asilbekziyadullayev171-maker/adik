from typing import Dict, Any, List
from pydantic import BaseModel

class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str]
    warnings: List[str]

class ClinicalDataValidator:
    def __init__(self):
        pass

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        errors = []
        warnings = []
        
        # Check required sections
        if 'vital_signs' not in data and 'symptoms' not in data:
            errors.append("Ma'lumotlar yetarli emas (hayotiy ko'rsatkichlar yoki simptomlar kiritilishi shart)")
            
        vitals = data.get('vital_signs', {})
        
        # Check physical limits
        sys = vitals.get('systolic_bp')
        dia = vitals.get('diastolic_bp')
        
        if sys is not None:
            if not isinstance(sys, (int, float)):
                errors.append("Sistolik qon bosimi raqam bo'lishi kerak")
            elif sys < 0 or sys > 300:
                errors.append("Sistolik qon bosimi noto'g'ri oraliqda (0-300)")
                
        if dia is not None:
            if not isinstance(dia, (int, float)):
                errors.append("Diastolik qon bosimi raqam bo'lishi kerak")
            elif dia < 0 or dia > 200:
                errors.append("Diastolik qon bosimi noto'g'ri oraliqda (0-200)")

        # Logical consistency
        if sys is not None and dia is not None and isinstance(sys, (int, float)) and isinstance(dia, (int, float)):
            if dia >= sys:
                errors.append("Diastolik qon bosimi sistolik bosimdan katta yoki teng bo'lolmaydi")

        pulse = vitals.get('pulse')
        if pulse is not None:
            if not isinstance(pulse, (int, float)) or pulse < 0 or pulse > 300:
                errors.append("Yurak urishi noto'g'ri oraliqda")

        spo2 = vitals.get('spo2')
        if spo2 is not None:
            if not isinstance(spo2, (int, float)) or spo2 < 0 or spo2 > 100:
                errors.append("SpO2 noto'g'ri oraliqda (0-100)")

        temp = vitals.get('temperature')
        if temp is not None:
            if not isinstance(temp, (int, float)) or temp < 20 or temp > 45:
                errors.append("Harorat noto'g'ri oraliqda (20-45)")

        symptoms = data.get('symptoms', [])
        if not symptoms and not vitals:
            warnings.append("Simptomlar va hayotiy ko'rsatkichlar kiritilmagan")
            
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )
