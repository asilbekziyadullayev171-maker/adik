from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import DoctorAssessment, Diagnosis, Referral, FollowUp, Prescription
import uuid

async def create_assessment(db: AsyncSession, visit_id: uuid.UUID, doctor_id: uuid.UUID, data) -> DoctorAssessment:
    # Check if an assessment already exists for this visit
    res = await db.execute(select(DoctorAssessment).where(DoctorAssessment.visit_id == visit_id))
    existing = res.scalars().first()
    if existing:
        for key, val in data.model_dump(exclude_unset=True).items():
            setattr(existing, key, val)
        existing.doctor_id = doctor_id
        await db.commit()
        await db.refresh(existing)
        return existing

    assessment = DoctorAssessment(visit_id=visit_id, doctor_id=doctor_id, **data.model_dump())
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment

async def add_diagnosis(db: AsyncSession, assessment_id: uuid.UUID, data) -> Diagnosis:
    diag = Diagnosis(doctor_assessment_id=assessment_id, **data.model_dump())
    db.add(diag)
    await db.commit()
    await db.refresh(diag)
    return diag

async def create_referral(db: AsyncSession, assessment_id: uuid.UUID, data) -> Referral:
    ref = Referral(doctor_assessment_id=assessment_id, **data.model_dump())
    db.add(ref)
    await db.commit()
    await db.refresh(ref)
    return ref

async def create_follow_up(db: AsyncSession, assessment_id: uuid.UUID, data) -> FollowUp:
    follow = FollowUp(doctor_assessment_id=assessment_id, **data.model_dump())
    db.add(follow)
    await db.commit()
    await db.refresh(follow)
    return follow

async def add_prescription(db: AsyncSession, assessment_id: uuid.UUID, data) -> Prescription:
    presc = Prescription(doctor_assessment_id=assessment_id, **data.model_dump())
    db.add(presc)
    await db.commit()
    await db.refresh(presc)
    return presc

async def complete_review(db: AsyncSession, visit_id: uuid.UUID, doctor_id: uuid.UUID) -> None:
    from app.services.visit_service import update_visit_status
    await update_visit_status(db, visit_id, "completed")

async def send_message_to_nurse(db: AsyncSession, visit_id: uuid.UUID, doctor_id: uuid.UUID, message: str) -> None:
    pass
