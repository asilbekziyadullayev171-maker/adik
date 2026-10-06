from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models import Visit, VisitSymptom, VitalSign, LabResult, AnamnesisResponse, Patient
from app.schemas.visit import VisitCreate
import uuid

async def create_visit(db: AsyncSession, data: VisitCreate, nurse_id: uuid.UUID, clinic_id: int) -> Visit:
    visit = Visit(
        patient_id=data.patient_id,
        nurse_id=nurse_id,
        clinic_id=clinic_id,
        chief_complaint=data.chief_complaint,
        notes=data.notes,
        status="draft"
    )
    db.add(visit)
    await db.commit()
    await db.refresh(visit)
    return visit

async def get_visit(db: AsyncSession, visit_id: uuid.UUID) -> Visit | None:
    query = (
        select(Visit)
        .options(
            selectinload(Visit.patient).selectinload(Patient.village),
            selectinload(Visit.symptoms).selectinload(VisitSymptom.symptom),
            selectinload(Visit.vital_signs),
            selectinload(Visit.ai_assessment),
            selectinload(Visit.doctor_assessment),
            selectinload(Visit.red_flag_alerts),
            selectinload(Visit.lab_results),
            selectinload(Visit.anamnesis_responses),
            selectinload(Visit.attachments),
        )
        .where(Visit.id == visit_id)
    )
    result = await db.execute(query)
    v = result.scalars().first()
    if v and v.patient:
        v.patient_first_name = v.patient.first_name
        v.patient_last_name = v.patient.last_name
    return v

async def get_visits(db: AsyncSession, filters: dict, pagination: dict) -> list[Visit]:
    page = pagination.get("page", 1)
    size = pagination.get("size", 20)
    query = (
        select(Visit)
        .options(
            selectinload(Visit.patient),
            selectinload(Visit.symptoms),
            selectinload(Visit.vital_signs),
            selectinload(Visit.attachments),
        )
        .order_by(Visit.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(query)
    visits = list(result.scalars().all())
    for v in visits:
        if v.patient:
            v.patient_first_name = v.patient.first_name
            v.patient_last_name = v.patient.last_name
        v.symptom_count = len(v.symptoms) if v.symptoms else 0
    return visits

async def update_visit_status(db: AsyncSession, visit_id: uuid.UUID, status: str) -> Visit | None:
    visit = await get_visit(db, visit_id)
    if visit:
        visit.status = status
        await db.commit()
        await db.refresh(visit)
    return visit

async def add_symptoms(db: AsyncSession, visit_id: uuid.UUID, symptoms_data: list) -> list[VisitSymptom]:
    symptoms = []
    for data in symptoms_data:
        symp = VisitSymptom(visit_id=visit_id, **data.model_dump())
        db.add(symp)
        symptoms.append(symp)
    await db.commit()
    return symptoms

async def add_vital_signs(db: AsyncSession, visit_id: uuid.UUID, vitals_data) -> VitalSign:
    vitals = VitalSign(visit_id=visit_id, **vitals_data.model_dump())
    db.add(vitals)
    await db.commit()
    await db.refresh(vitals)
    return vitals

async def update_vital_signs(db: AsyncSession, visit_id: uuid.UUID, vitals_data) -> VitalSign | None:
    result = await db.execute(select(VitalSign).where(VitalSign.visit_id == visit_id))
    vitals = result.scalars().first()
    if vitals:
        for key, val in vitals_data.model_dump(exclude_unset=True).items():
            setattr(vitals, key, val)
        await db.commit()
        await db.refresh(vitals)
    return vitals

async def add_lab_results(db: AsyncSession, visit_id: uuid.UUID, lab_data: list) -> list[LabResult]:
    results = []
    for data in lab_data:
        res = LabResult(visit_id=visit_id, **data.model_dump())
        db.add(res)
        results.append(res)
    await db.commit()
    return results

async def add_anamnesis(db: AsyncSession, visit_id: uuid.UUID, anamnesis_data: list) -> list[AnamnesisResponse]:
    responses = []
    for data in anamnesis_data:
        ans = AnamnesisResponse(visit_id=visit_id, **data.model_dump())
        db.add(ans)
        responses.append(ans)
    await db.commit()
    return responses

async def submit_to_doctor(db: AsyncSession, visit_id: uuid.UUID) -> Visit | None:
    return await update_visit_status(db, visit_id, "pending_doctor")

async def get_doctor_queue(db: AsyncSession, doctor_id: uuid.UUID, filters: dict) -> list[Visit]:
    status_filter = filters.get("status")
    query = (
        select(Visit)
        .options(
            selectinload(Visit.patient),
            selectinload(Visit.symptoms),
            selectinload(Visit.vital_signs),
            selectinload(Visit.attachments),
            selectinload(Visit.ai_assessment),
        )
    )
    if status_filter:
        query = query.where(Visit.status == status_filter)
    query = query.order_by(Visit.urgency.desc(), Visit.created_at.desc())
    result = await db.execute(query)
    visits = list(result.scalars().all())
    for v in visits:
        if v.patient:
            v.patient_first_name = v.patient.first_name
            v.patient_last_name = v.patient.last_name
        v.symptom_count = len(v.symptoms) if v.symptoms else 0
    return visits
