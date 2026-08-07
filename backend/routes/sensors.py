from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/sensors", tags=["IoT Sensors"])


@router.get("/")
def list_sensors(db: Session = Depends(get_db)):
    return db.query(models.IoTSensor).all()


@router.get("/{sensor_id}")
def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    s = db.query(models.IoTSensor).filter(models.IoTSensor.id == sensor_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return s


@router.patch("/{sensor_id}/reading")
def update_sensor_reading(sensor_id: int, data: dict, db: Session = Depends(get_db)):
    s = db.query(models.IoTSensor).filter(models.IoTSensor.id == sensor_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sensor not found")
    if "last_reading" in data:
        s.last_reading = data["last_reading"]
    from datetime import datetime
    s.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(s)
    return s
