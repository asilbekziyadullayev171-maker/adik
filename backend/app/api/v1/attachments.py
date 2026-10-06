import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from datetime import datetime

from app.api import deps
from app.models import VisitAttachment, Visit, User

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AttachmentResponse(BaseModel):
    id: uuid.UUID
    visit_id: uuid.UUID
    file_name: str
    file_url: str
    file_type: str
    category: str
    title: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/visits/{id}/attachments", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    id: uuid.UUID,
    file: UploadFile = File(...),
    category: str = Form("clinical_photo"),
    title: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Verify visit exists
    res = await db.execute(select(Visit).where(Visit.id == id))
    visit = res.scalars().first()
    if not visit:
        raise HTTPException(status_code=404, detail="Ko'rik (Visit) topilmadi")

    # Generate unique filename
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{ext}"
    
    visit_folder = os.path.join(UPLOAD_DIR, "visits", str(id))
    os.makedirs(visit_folder, exist_ok=True)
    
    file_path = os.path.join(visit_folder, unique_filename)
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    file_url = f"/uploads/visits/{id}/{unique_filename}"

    attachment = VisitAttachment(
        visit_id=id,
        file_name=file.filename or unique_filename,
        file_url=file_url,
        file_type=file.content_type or "image/jpeg",
        category=category,
        title=title or file.filename,
        notes=notes,
        uploaded_by=current_user.id
    )

    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    return attachment

@router.get("/visits/{id}/attachments", response_model=List[AttachmentResponse])
async def get_visit_attachments(
    id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    res = await db.execute(
        select(VisitAttachment)
        .where(VisitAttachment.visit_id == id)
        .order_by(VisitAttachment.created_at.desc())
    )
    return res.scalars().all()

@router.delete("/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    attachment_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    res = await db.execute(select(VisitAttachment).where(VisitAttachment.id == attachment_id))
    attachment = res.scalars().first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Fayl topilmadi")

    # Delete from filesystem if exists
    rel_path = attachment.file_url.replace("/uploads/", "")
    full_path = os.path.join(UPLOAD_DIR, rel_path)
    if os.path.exists(full_path):
        try:
            os.remove(full_path)
        except Exception:
            pass

    await db.delete(attachment)
    await db.commit()
