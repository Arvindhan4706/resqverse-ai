from sqlalchemy.orm import Session
from .evacuation import EvacuationAgent
from .resource import ResourceAgent
from .medical import MedicalAgent
from .route import RouteAgent
import models

AGENTS = [
    EvacuationAgent(),
    ResourceAgent(),
    MedicalAgent(),
    RouteAgent(),
]

def run_agents_for_incident(db: Session, incident_id: int):
    """
    Orchestrates the AI agents.
    Fetches the incident and context from DB, runs all agents,
    and stores the generated recommendations in the database.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        return []

    incident_dict = {
        "id": incident.id,
        "disaster_type": incident.disaster_type,
        "severity": incident.severity,
        "affected_population": incident.affected_population,
    }

    # Gather system context
    total_shelter_capacity = sum(s.total_capacity for s in db.query(models.Shelter).all())
    total_shelter_occupancy = sum(s.current_occupancy for s in db.query(models.Shelter).all())
    
    hospitals = db.query(models.Hospital).all()
    total_hospital_beds_available = sum(h.available_beds for h in hospitals)

    context_dict = {
        "shelter_capacity": total_shelter_capacity,
        "shelter_occupancy": total_shelter_occupancy,
        "hospital_beds_available": total_hospital_beds_available,
    }

    results = []
    for agent in AGENTS:
        try:
            res = agent.run(incident_dict, context_dict)
            
            # If agent doesn't require approval and has high confidence, we could auto-approve.
            # But for the hackathon, we save them as pending so the UI can demonstrate human-in-the-loop.
            
            # Delete any previous pending recommendation by this agent for this incident
            db.query(models.AgentRecommendation).filter(
                models.AgentRecommendation.incident_id == incident.id,
                models.AgentRecommendation.agent_name == res.agent_name,
                models.AgentRecommendation.status == "pending"
            ).delete()

            db_rec = models.AgentRecommendation(
                incident_id=incident.id,
                agent_name=res.agent_name,
                recommendation=res.recommendation,
                reasoning=res.reasoning,
                confidence=res.confidence,
                risk_level=res.risk_level,
                data_used=res.data_used,
                requires_human_approval=res.requires_human_approval,
                status="pending"
            )
            db.add(db_rec)
            results.append(db_rec)
        except Exception as e:
            print(f"Error running {agent.name}: {e}")

    db.commit()
    return results
