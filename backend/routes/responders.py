from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/responders", tags=["Responders"])


@router.get("/")
def list_responders(
    status: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(models.Responder)
    if status:
        q = q.filter(models.Responder.status == status)
    if role:
        q = q.filter(models.Responder.role == role)
    return q.all()


@router.get("/{responder_id}")
def get_responder(responder_id: int, db: Session = Depends(get_db)):
    r = db.query(models.Responder).filter(models.Responder.id == responder_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Responder not found")
    return r


@router.patch("/{responder_id}")
def update_responder(responder_id: int, data: dict, db: Session = Depends(get_db)):
    r = db.query(models.Responder).filter(models.Responder.id == responder_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Responder not found")
    for key, value in data.items():
        setattr(r, key, value)
    db.commit()
    db.refresh(r)
    return r
