from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/shelters", tags=["Shelters"])


@router.get("/")
def list_shelters(db: Session = Depends(get_db)):
    return db.query(models.Shelter).all()


@router.get("/{shelter_id}")
def get_shelter(shelter_id: int, db: Session = Depends(get_db)):
    s = db.query(models.Shelter).filter(models.Shelter.id == shelter_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Shelter not found")
    return s


@router.patch("/{shelter_id}/occupancy")
def update_occupancy(shelter_id: int, data: dict, db: Session = Depends(get_db)):
    s = db.query(models.Shelter).filter(models.Shelter.id == shelter_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Shelter not found")
    if "current_occupancy" in data:
        s.current_occupancy = min(data["current_occupancy"], s.total_capacity)
    db.commit()
    db.refresh(s)
    return s
