from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models import ContactMessage, User
from schemas import ContactMessageCreate, ContactMessageOut
from auth.dependencies import require_admin

router = APIRouter()


@router.post("", response_model=ContactMessageOut, status_code=status.HTTP_201_CREATED)
async def submit_contact_message(payload: ContactMessageCreate, db: AsyncSession = Depends(get_db)):
    message = ContactMessage(name=payload.name, email=payload.email, message=payload.message)
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


@router.get("", response_model=list[ContactMessageOut])
async def list_contact_messages(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(ContactMessage).order_by(ContactMessage.created_at.desc()))
    return result.scalars().all()