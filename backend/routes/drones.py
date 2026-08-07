from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/drones", tags=["Drones"])


@router.get("/")
def list_drones(db: Session = Depends(get_db)):
    return db.query(models.Drone).all()


@router.get("/{drone_id}")
def get_drone(drone_id: int, db: Session = Depends(get_db)):
    d = db.query(models.Drone).filter(models.Drone.id == drone_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Drone not found")
    return d


@router.patch("/{drone_id}/position")
def update_drone_position(drone_id: int, data: dict, db: Session = Depends(get_db)):
    d = db.query(models.Drone).filter(models.Drone.id == drone_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Drone not found")
    for key in ("latitude", "longitude", "altitude", "battery_level", "status"):
        if key in data:
            setattr(d, key, data[key])
    from datetime import datetime
    d.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(d)
    return d
