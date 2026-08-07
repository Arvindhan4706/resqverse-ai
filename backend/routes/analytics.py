from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):
    total_incidents = db.query(models.Incident).count()
    active_incidents = db.query(models.Incident).filter(models.Incident.status == "active").count()
    critical_incidents = db.query(models.Incident).filter(models.Incident.severity == "critical").count()
    total_affected = db.query(models.Incident).with_entities(models.Incident.affected_population).all()
    people_affected = sum((r[0] or 0) for r in total_affected)

    available_responders = db.query(models.Responder).filter(models.Responder.status == "available").count()
    total_responders = db.query(models.Responder).count()

    available_vehicles = db.query(models.Resource).filter(
        models.Resource.status == "available",
        models.Resource.resource_type == "vehicle"
    ).count()

    shelters = db.query(models.Shelter).all()
    total_shelter_cap = sum(s.total_capacity for s in shelters)
    total_shelter_occ = sum(s.current_occupancy for s in shelters)

    hospitals = db.query(models.Hospital).all()
    total_beds = sum(h.total_beds for h in hospitals)
    available_beds = sum(h.available_beds for h in hospitals)

    pending_approvals = db.query(models.AgentRecommendation).filter(
        models.AgentRecommendation.status == "pending"
    ).count()

    critical_sensors = db.query(models.IoTSensor).filter(
        models.IoTSensor.status == "active"
    ).all()
    sensor_alerts = [
        s for s in critical_sensors
        if s.last_reading is not None and s.threshold_critical is not None
        and s.last_reading >= s.threshold_critical
    ]

    return {
        "total_incidents": total_incidents,
        "active_incidents": active_incidents,
        "critical_incidents": critical_incidents,
        "people_affected": people_affected,
        "available_responders": available_responders,
        "total_responders": total_responders,
        "available_vehicles": available_vehicles,
        "shelter_capacity": total_shelter_cap,
        "shelter_occupancy": total_shelter_occ,
        "shelter_occupancy_pct": round(total_shelter_occ / total_shelter_cap * 100, 1) if total_shelter_cap > 0 else 0,
        "hospital_beds_total": total_beds,
        "hospital_beds_available": available_beds,
        "hospital_occupancy_pct": round((total_beds - available_beds) / total_beds * 100, 1) if total_beds > 0 else 0,
        "pending_approvals": pending_approvals,
        "sensor_critical_alerts": len(sensor_alerts),
        "sensor_alert_ids": [s.sensor_id for s in sensor_alerts],
    }
