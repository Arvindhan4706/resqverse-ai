from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("/")
def list_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    disaster_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(models.Incident)
    if status:
        q = q.filter(models.Incident.status == status)
    if severity:
        q = q.filter(models.Incident.severity == severity)
    if disaster_type:
        q = q.filter(models.Incident.disaster_type == disaster_type)
    return q.order_by(models.Incident.created_at.desc()).all()


@router.get("/{incident_id}")
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc


@router.post("/")
def create_incident(data: dict, db: Session = Depends(get_db)):
    inc = models.Incident(**data, is_simulated=True)
    db.add(inc)
    db.commit()
    db.refresh(inc)
    return inc


@router.patch("/{incident_id}")
def update_incident(incident_id: int, data: dict, db: Session = Depends(get_db)):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    for key, value in data.items():
        setattr(inc, key, value)
    db.commit()
    db.refresh(inc)
    return inc
