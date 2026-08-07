from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])


@router.get("/")
def list_hospitals(db: Session = Depends(get_db)):
    return db.query(models.Hospital).filter(models.Hospital.is_operational == True).all()


@router.get("/{hospital_id}")
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    h = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return h


@router.patch("/{hospital_id}/capacity")
def update_capacity(hospital_id: int, data: dict, db: Session = Depends(get_db)):
    h = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    if "available_beds" in data:
        h.available_beds = data["available_beds"]
    if "available_icu" in data:
        h.available_icu = data["available_icu"]
    db.commit()
    db.refresh(h)
    return h
