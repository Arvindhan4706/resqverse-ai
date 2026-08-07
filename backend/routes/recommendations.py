from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])


@router.get("/")
def list_recommendations(
    incident_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(models.AgentRecommendation)
    if incident_id:
        q = q.filter(models.AgentRecommendation.incident_id == incident_id)
    if status:
        q = q.filter(models.AgentRecommendation.status == status)
    return q.order_by(models.AgentRecommendation.created_at.desc()).all()


@router.get("/{rec_id}")
def get_recommendation(rec_id: int, db: Session = Depends(get_db)):
    r = db.query(models.AgentRecommendation).filter(models.AgentRecommendation.id == rec_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return r


@router.post("/{rec_id}/approve")
def approve_recommendation(rec_id: int, data: dict, db: Session = Depends(get_db)):
    r = db.query(models.AgentRecommendation).filter(models.AgentRecommendation.id == rec_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    from datetime import datetime
    r.status = "approved"
    r.approved_by = data.get("approved_by", "unknown")
    r.approved_at = datetime.utcnow()
    # Create audit log
    log = models.AuditLog(
        action="recommendation_approved",
        entity_type="recommendation",
        entity_id=rec_id,
        performed_by=data.get("approved_by", "unknown"),
        details={"recommendation_id": rec_id, "agent": r.agent_name}
    )
    db.add(log)
    db.commit()
    db.refresh(r)
    return r


@router.post("/{rec_id}/reject")
def reject_recommendation(rec_id: int, data: dict, db: Session = Depends(get_db)):
    r = db.query(models.AgentRecommendation).filter(models.AgentRecommendation.id == rec_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    r.status = "rejected"
    r.approved_by = data.get("rejected_by", "unknown")
    log = models.AuditLog(
        action="recommendation_rejected",
        entity_type="recommendation",
        entity_id=rec_id,
        performed_by=data.get("rejected_by", "unknown"),
        details={"reason": data.get("reason", "No reason provided"), "agent": r.agent_name}
    )
    db.add(log)
    db.commit()
    db.refresh(r)
    return r
