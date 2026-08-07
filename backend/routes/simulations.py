from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any

from database import get_db
import models
from agents.orchestrator import run_agents_for_incident

router = APIRouter(prefix="/simulations", tags=["Simulations"])

@router.get("/")
def list_simulations(db: Session = Depends(get_db)):
    """List all available simulation scenarios."""
    return db.query(models.SimulationScenario).all()

@router.post("/")
def create_simulation(scenario: dict, db: Session = Depends(get_db)):
    """Create a new simulation scenario."""
    db_sim = models.SimulationScenario(
        name=scenario.get("name"),
        scenario_type=scenario.get("scenario_type"),
        severity=scenario.get("severity", 5),
        parameters=scenario.get("parameters", {})
    )
    db.add(db_sim)
    db.commit()
    db.refresh(db_sim)
    return db_sim

@router.post("/{sim_id}/start")
def start_simulation(sim_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Starts a simulation scenario, generates a mock incident, and triggers agents."""
    sim = db.query(models.SimulationScenario).filter(models.SimulationScenario.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
        
    if sim.status == "running":
        return {"status": "already running", "simulation": sim}
        
    sim.status = "running"
    sim.started_at = datetime.utcnow()
    
    # Generate an incident based on this scenario
    severity_map = {
        1: "low", 2: "low", 3: "low",
        4: "medium", 5: "medium", 6: "medium",
        7: "high", 8: "high",
        9: "critical", 10: "critical"
    }
    severity_str = severity_map.get(sim.severity, "medium")
    
    params = sim.parameters or {}
    location_name = params.get("location_name", "Simulation Zone")
    affected_population = params.get("affected_population", sim.severity * 2000)
    
    incident = models.Incident(
        title=f"[SIM] {sim.name}",
        description=f"Simulated {sim.scenario_type} incident started from Simulation Center.",
        disaster_type=sim.scenario_type,
        severity=severity_str,
        status="active",
        latitude=params.get("latitude", 13.0827),
        longitude=params.get("longitude", 80.2707),
        location_name=location_name,
        affected_population=affected_population,
        created_by="system.simulator",
        is_simulated=True
    )
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # Save the generated incident ID back to simulation parameters so we can resolve it later
    params["generated_incident_id"] = incident.id
    sim.parameters = params
    
    # Audit log
    audit = models.AuditLog(
        action="simulation_started",
        entity_type="simulation",
        entity_id=sim.id,
        performed_by="system.simulator",
        details={"scenario": sim.name, "incident_id": incident.id, "severity": sim.severity}
    )
    db.add(audit)
    db.commit()
    
    # Trigger agents in background
    background_tasks.add_task(run_agents_for_incident, db, incident.id)
    
    return {"status": "started", "simulation": sim, "incident_id": incident.id}

@router.post("/{sim_id}/pause")
def pause_simulation(sim_id: int, db: Session = Depends(get_db)):
    sim = db.query(models.SimulationScenario).filter(models.SimulationScenario.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
        
    sim.status = "paused"
    db.commit()
    return {"status": "paused", "simulation": sim}

@router.post("/{sim_id}/stop")
def stop_simulation(sim_id: int, db: Session = Depends(get_db)):
    """Stops the simulation and resolves the generated incident."""
    sim = db.query(models.SimulationScenario).filter(models.SimulationScenario.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
        
    sim.status = "idle"
    sim.ended_at = datetime.utcnow()
    
    params = sim.parameters or {}
    incident_id = params.get("generated_incident_id")
    
    if incident_id:
        incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
        if incident:
            incident.status = "resolved"
    
    # Audit log
    audit = models.AuditLog(
        action="simulation_stopped",
        entity_type="simulation",
        entity_id=sim.id,
        performed_by="system.simulator",
        details={"scenario": sim.name, "incident_id": incident_id}
    )
    db.add(audit)
    db.commit()
    
    return {"status": "stopped", "simulation": sim}
