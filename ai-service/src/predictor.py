from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class Condition(BaseModel):
    condition: str
    condition_uz: str
    likelihood: float
    icd10: str

class RiskFactor(BaseModel):
    factor: str
    value: Any
    impact: float
    direction: str
    explanation_uz: str

class MissingDataInfo(BaseModel):
    field: str
    importance: str
    reason_uz: str

class PredictionResult(BaseModel):
    risk_level: str
    risk_score: float
    confidence: float
    potential_conditions: List[Condition]
    risk_factors: List[RiskFactor]
    missing_data: List[MissingDataInfo]

class RiskPredictor:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        # Model loading logic would go here for Phase 6

    def predict(self, features: Dict[str, float]) -> PredictionResult:
        score = 0.0
        max_score = 100.0
        factors = []
        conditions = []
        
        # Rule-based scoring
        # Blood Pressure
        sys = features.get('systolic_bp')
        dia = features.get('diastolic_bp')
        if sys is not None:
            if sys > 180 or sys < 90:
                score += 25
                factors.append(RiskFactor(factor='systolic_bp', value=sys, impact=25, direction='high', explanation_uz='Sistolik bosim xavfli darajada'))
            elif sys > 140:
                score += 15
                factors.append(RiskFactor(factor='systolic_bp', value=sys, impact=15, direction='high', explanation_uz='Sistolik bosim yuqori'))

        # Pulse
        pulse = features.get('pulse')
        if pulse is not None:
            if pulse > 120 or pulse < 50:
                score += 20
                factors.append(RiskFactor(factor='pulse', value=pulse, impact=20, direction='high', explanation_uz='Yurak urishi xavfli darajada'))
            elif pulse > 100:
                score += 10
                factors.append(RiskFactor(factor='pulse', value=pulse, impact=10, direction='high', explanation_uz='Yurak urishi tezlashgan'))

        # SpO2
        spo2 = features.get('spo2')
        if spo2 is not None:
            if spo2 < 90:
                score += 30
                factors.append(RiskFactor(factor='spo2', value=spo2, impact=30, direction='high', explanation_uz='Kislorod miqdori juda past'))
            elif spo2 < 95:
                score += 15
                factors.append(RiskFactor(factor='spo2', value=spo2, impact=15, direction='high', explanation_uz='Kislorod miqdori pasaygan'))

        # Temperature
        temp = features.get('temperature')
        if temp is not None:
            if temp > 39.5 or temp < 35.0:
                score += 20
                factors.append(RiskFactor(factor='temperature', value=temp, impact=20, direction='high', explanation_uz='Tana harorati keskin o\'zgargan'))

        # Symptoms
        if features.get('has_chest_pain', 0) > 0:
            score += 25
            factors.append(RiskFactor(factor='chest_pain', value=1, impact=25, direction='high', explanation_uz='Ko\'krak og\'rig\'i'))
            
            if sys is not None and sys > 140 and pulse is not None and pulse > 100:
                conditions.append(Condition(condition="Acute coronary syndrome", condition_uz="O'tkir koronar sindrom xavfi", likelihood=0.8, icd10="I24.9"))
                
        if features.get('has_syncope', 0) > 0:
            score += 25
            factors.append(RiskFactor(factor='syncope', value=1, impact=25, direction='high', explanation_uz='Hushdan ketish'))

        # History
        if features.get('chronic_diseases_count', 0) > 0:
            points = min(15, features['chronic_diseases_count'] * 5)
            score += points
            factors.append(RiskFactor(factor='chronic_diseases_count', value=features['chronic_diseases_count'], impact=points, direction='medium', explanation_uz='Surunkali kasalliklar mavjud'))
            
        age = features.get('age')
        if age is not None and age > 60:
            score += 10
            factors.append(RiskFactor(factor='age', value=age, impact=10, direction='medium', explanation_uz='Yosh omili (>60)'))

        # Condition Mappings (Simple Rule-Based)
        if features.get('has_fever', 0) > 0 and features.get('has_cough', 0) > 0 and (spo2 is not None and spo2 < 95):
            conditions.append(Condition(condition="Pneumonia", condition_uz="Pnevmoniya xavfi", likelihood=0.7, icd10="J18.9"))
        if features.get('has_headache', 0) > 0 and (sys is not None and sys > 180):
            conditions.append(Condition(condition="Hypertensive crisis", condition_uz="Gipertonik kriz", likelihood=0.85, icd10="I10"))

        # Normalize score
        normalized_score = min(1.0, score / max_score)
        
        if normalized_score < 0.25:
            risk_level = 'LOW'
        elif normalized_score < 0.50:
            risk_level = 'MODERATE'
        elif normalized_score < 0.75:
            risk_level = 'HIGH'
        else:
            risk_level = 'EMERGENCY'

        # Missing data calculation
        missing = []
        required_vitals = ['systolic_bp', 'pulse', 'spo2', 'temperature']
        for v in required_vitals:
            if features.get(v) is None:
                missing.append(MissingDataInfo(field=v, importance='high', reason_uz=f'{v} ko\'rsatkichi baholash uchun muhim'))

        return PredictionResult(
            risk_level=risk_level,
            risk_score=normalized_score,
            confidence=0.8 - (len(missing) * 0.1), # Lower confidence if missing data
            potential_conditions=conditions,
            risk_factors=factors,
            missing_data=missing
        )
