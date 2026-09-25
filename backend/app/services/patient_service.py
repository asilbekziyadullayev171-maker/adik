from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.models import Patient
from app.schemas.patient import PatientCreate, PatientUpdate
import uuid

async def create_patient(db: AsyncSession, data: PatientCreate, created_by_id: uuid.UUID) -> Patient:
    patient_dict = data.model_dump()
    patient = Patient(**patient_dict, created_by=created_by_id)
    from datetime import date
    year = date.today().year
    result = await db.execute(select(Patient))
    count = len(result.scalars().all())
    patient.patient_code = f"QM-{year}-{count+1:05d}"
    
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient

async def get_patient(db: AsyncSession, patient_id: uuid.UUID) -> Patient | None:
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    return result.scalars().first()

async def get_patients(db: AsyncSession, filters: dict, pagination: dict) -> list[Patient]:
    query = select(Patient)
    page = pagination.get("page", 1)
    size = pagination.get("size", 20)
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    return list(result.scalars().all())

async def update_patient(db: AsyncSession, patient_id: uuid.UUID, data: PatientUpdate) -> Patient | None:
    patient = await get_patient(db, patient_id)
    if not patient:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)
        
    await db.commit()
    await db.refresh(patient)
    return patient

async def search_patients(db: AsyncSession, query_str: str, nurse_clinic_ids: list[int] = None) -> list[Patient]:
    query = select(Patient).where(
        or_(
            Patient.first_name.ilike(f"%{query_str}%"),
            Patient.last_name.ilike(f"%{query_str}%"),
            Patient.phone.ilike(f"%{query_str}%"),
            Patient.patient_code.ilike(f"%{query_str}%")
        )
    )
    result = await db.execute(query)
    return list(result.scalars().all())

async def check_duplicate(db: AsyncSession, first_name: str, last_name: str, date_of_birth: str, village_id: int) -> Patient | None:
    query = select(Patient).where(
        Patient.first_name == first_name,
        Patient.last_name == last_name,
        Patient.date_of_birth == date_of_birth,
        Patient.village_id == village_id
    )
    result = await db.execute(query)
    return result.scalars().first()

async def get_patient_history(db: AsyncSession, patient_id: uuid.UUID) -> dict:
    from app.models import MedicalHistory, Medication, Allergy
    
    history = await db.execute(select(MedicalHistory).where(MedicalHistory.patient_id == patient_id))
    medications = await db.execute(select(Medication).where(Medication.patient_id == patient_id))
    allergies = await db.execute(select(Allergy).where(Allergy.patient_id == patient_id))
    
    return {
        "medical_history": list(history.scalars().all()),
        "medications": list(medications.scalars().all()),
        "allergies": list(allergies.scalars().all())
    }
