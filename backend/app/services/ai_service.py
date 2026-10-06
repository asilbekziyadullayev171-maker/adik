import os
import sys
import uuid
import time
import logging
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models import AIAssessment, Visit, Patient, VitalSign, VisitSymptom, Symptom, RedFlagAlert
from app.config import get_settings

# Make sure ai-service is in sys.path
AI_SERVICE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ai-service"))
if AI_SERVICE_DIR not in sys.path:
    sys.path.append(AI_SERVICE_DIR)

from src.gemini_predictor import GeminiPredictor
from src.red_flag_engine import RedFlagEngine

logger = logging.getLogger(__name__)

async def run_assessment(db: AsyncSession, visit_id: uuid.UUID) -> AIAssessment:
    """
    Run full AI triage assessment on a visit using Google Gemini and Red Flag Engine.
    """
    # 1. Fetch visit with all clinical details
    stmt = (
        select(Visit)
        .options(
            selectinload(Visit.patient),
            selectinload(Visit.vital_signs),
            selectinload(Visit.symptoms).selectinload(VisitSymptom.symptom)
        )
        .where(Visit.id == visit_id)
    )
    result = await db.execute(stmt)
    visit = result.scalars().first()
    if not visit:
        raise ValueError(f"Visit {visit_id} topilmadi")

    settings = get_settings()

    # 2. Calculate patient age and demographics
    age = None
    gender = "unknown"
    if visit.patient:
        if visit.patient.date_of_birth:
            today = date.today()
            dob = visit.patient.date_of_birth
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        gender = visit.patient.gender or "unknown"

    patient_data = {
        "demographics": {
            "age": age,
            "gender": gender
        },
        "chief_complaint": visit.chief_complaint or "",
        "vital_signs": {},
        "symptoms": [],
        "anamnesis": {},
        "medical_history": {}
    }

    # Extract vital signs
    if visit.vital_signs:
        vs = visit.vital_signs
        patient_data["vital_signs"] = {
            "systolic_bp": vs.systolic_bp,
            "diastolic_bp": vs.diastolic_bp,
            "pulse": vs.pulse,
            "temperature": float(vs.temperature) if vs.temperature is not None else None,
            "spo2": vs.spo2,
            "respiratory_rate": vs.respiratory_rate,
            "weight": float(vs.weight) if vs.weight is not None else None,
            "height": float(vs.height) if vs.height is not None else None,
        }

    # Extract symptoms
    if visit.symptoms:
        for s in visit.symptoms:
            code = s.symptom.code if s.symptom else "unknown"
            name_uz = s.symptom.name_uz if s.symptom else code
            patient_data["symptoms"].append({
                "name": code,
                "name_uz": name_uz,
                "severity": s.severity or "moderate",
                "duration_value": s.duration_value,
                "duration_unit": s.duration_unit or "days",
                "onset": s.onset or "gradual"
            })

    # 3. Check Red Flags (runs independently first)
    rf_engine = RedFlagEngine()
    red_flags = rf_engine.check_red_flags(patient_data)
    
    for rf in red_flags:
        alert = RedFlagAlert(
            visit_id=visit.id,
            rule_code=rf.get("rule_id", "RED_FLAG"),
            rule_description=rf.get("message_uz", rf.get("description", "")),
            severity=rf.get("severity", "CRITICAL"),
            triggered_values=rf.get("triggered_values", {})
        )
        db.add(alert)

    # 4. Run Gemini Predictor
    t0 = time.time()
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    predictor = GeminiPredictor(
        api_key=api_key,
        model_name=settings.GEMINI_MODEL or "gemini-3.1-flash-lite"
    )
    
    prediction = predictor.predict(patient_data)
    inference_time = int((time.time() - t0) * 1000)

    # Determine risk level
    raw_risk = prediction.get("risk_level", "MODERATE")
    if red_flags:
        risk_level = "emergency"
        risk_score = 0.99
    else:
        risk_level = raw_risk.lower()
        risk_score = float(prediction.get("risk_score", 0.5))

    # Update visit triage status
    visit.risk_level = risk_level
    if risk_level == "emergency":
        visit.urgency = 3
    elif risk_level == "high":
        visit.urgency = 2
    elif risk_level == "moderate":
        visit.urgency = 1
    else:
        visit.urgency = 0

    confidence_val = 0.95 if prediction.get("confidence_level") == "yuqori" else 0.75

    # 5. Save AI Assessment record in DB
    assessment = AIAssessment(
        visit_id=visit.id,
        risk_level=risk_level,
        risk_score=min(max(risk_score, 0.0), 1.0),
        confidence=confidence_val,
        potential_conditions=prediction.get("potential_conditions", []),
        risk_factors=prediction.get("risk_factors", []),
        missing_data=prediction.get("missing_data", []),
        model_name=prediction.get("model_name", "gemini-3.1-flash-lite"),
        model_version="1.0",
        input_features=patient_data,
        inference_time_ms=inference_time
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment

async def run_quick_assessment(patient_data: dict) -> dict:
    import time
    from app.config import get_settings
    settings = get_settings()
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    predictor = GeminiPredictor(
        api_key=api_key,
        model_name=settings.GEMINI_MODEL or "gemini-3.5-flash"
    )
    prediction = predictor.predict(patient_data)
    
    # Process factors to ensure they are strings
    risk_factors = prediction.get("risk_factors", [])
    if risk_factors and isinstance(risk_factors[0], dict):
        risk_factors = [f.get("factor", str(f)) for f in risk_factors]
        
    missing_data = prediction.get("missing_data", [])
    if missing_data and isinstance(missing_data[0], dict):
        missing_data = [m.get("field", str(m)) for m in missing_data]

    return {
        "risk_level": prediction.get("risk_level", "moderate"),
        "risk_score": float(prediction.get("risk_score", 0.5)),
        "confidence_note": prediction.get("confidence_note", "Bu faqat sun'iy intellekt xulosasi, yakuniy tashxis emas."),
        "potential_conditions": prediction.get("potential_conditions", []),
        "risk_factors": risk_factors,
        "missing_data": missing_data
    }
