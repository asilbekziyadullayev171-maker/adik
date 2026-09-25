from sqlalchemy.ext.asyncio import AsyncSession
from app.models import AIAssessment
import uuid

async def run_assessment(db: AsyncSession, visit_id: uuid.UUID) -> AIAssessment:
    assessment = AIAssessment(
        visit_id=visit_id,
        risk_level="low",
        risk_score=10.5,
        confidence=0.85,
        potential_conditions=[{"condition": "Common Cold", "probability": 0.8}],
        risk_factors=["smoking"],
        missing_data=["temperature"],
        model_name="rule-based-mvp",
        model_version="1.0",
        input_features={}
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment
