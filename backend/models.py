from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    disaster_type = Column(String, nullable=False)  # flood, earthquake, wildfire, cyclone, chemical_leak
    severity = Column(String, nullable=False)        # low, medium, high, critical
    status = Column(String, default="active")        # active, resolved, monitoring
    latitude = Column(Float)
    longitude = Column(Float)
    location_name = Column(String)
    affected_population = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)
    is_simulated = Column(Boolean, default=True)

    resources = relationship("ResourceDeployment", back_populates="incident")
    recommendations = relationship("AgentRecommendation", back_populates="incident")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    total_beds = Column(Integer, default=0)
    available_beds = Column(Integer, default=0)
    icu_beds = Column(Integer, default=0)
    available_icu = Column(Integer, default=0)
    contact_number = Column(String)
    is_operational = Column(Boolean, default=True)
    is_simulated = Column(Boolean, default=True)


class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    total_capacity = Column(Integer, default=0)
    current_occupancy = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    has_medical = Column(Boolean, default=False)
    has_food = Column(Boolean, default=True)
    contact_person = Column(String)
    is_simulated = Column(Boolean, default=True)


class Responder(Base):
    __tablename__ = "responders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String)  # paramedic, firefighter, rescue_diver, coordinator
    status = Column(String, default="available")  # available, deployed, off_duty
    latitude = Column(Float)
    longitude = Column(Float)
    team = Column(String)
    contact_number = Column(String)
    specialization = Column(String)
    is_simulated = Column(Boolean, default=True)


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    resource_type = Column(String)  # vehicle, equipment, medical_supply, food
    category = Column(String)       # ambulance, fire_truck, rescue_boat, helicopter
    status = Column(String, default="available")
    quantity = Column(Integer, default=1)
    unit = Column(String, default="units")
    latitude = Column(Float)
    longitude = Column(Float)
    assigned_to = Column(String)
    is_simulated = Column(Boolean, default=True)


class ResourceDeployment(Base):
    __tablename__ = "resource_deployments"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    resource_id = Column(Integer, ForeignKey("resources.id"))
    deployed_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="deployed")

    incident = relationship("Incident", back_populates="resources")
    resource = relationship("Resource")


class IoTSensor(Base):
    __tablename__ = "iot_sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, unique=True, nullable=False)
    sensor_type = Column(String)   # water_level, seismic, weather, air_quality
    location_name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="active")  # active, inactive, fault
    last_reading = Column(Float)
    unit = Column(String)
    threshold_warning = Column(Float)
    threshold_critical = Column(Float)
    last_updated = Column(DateTime, default=datetime.utcnow)
    is_simulated = Column(Boolean, default=True)


class Drone(Base):
    __tablename__ = "drones"

    id = Column(Integer, primary_key=True, index=True)
    drone_id = Column(String, unique=True, nullable=False)
    model = Column(String)
    status = Column(String, default="standby")  # standby, airborne, returning, maintenance
    latitude = Column(Float)
    longitude = Column(Float)
    altitude = Column(Float, default=0)
    battery_level = Column(Integer, default=100)
    mission = Column(String)
    assigned_incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    is_simulated = Column(Boolean, default=True)


class AgentRecommendation(Base):
    __tablename__ = "agent_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String, nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    recommendation = Column(Text)
    reasoning = Column(Text)
    confidence = Column(Float)
    risk_level = Column(String)
    data_used = Column(JSON)
    requires_human_approval = Column(Boolean, default=True)
    status = Column(String, default="pending")  # pending, approved, rejected
    approved_by = Column(String)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="recommendations")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    entity_type = Column(String)
    entity_id = Column(Integer)
    performed_by = Column(String)
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    scenario_type = Column(String)  # flood, earthquake, wildfire, cyclone, chemical_leak
    severity = Column(Integer, default=5)       # 1-10
    status = Column(String, default="idle")     # idle, running, paused, completed
    parameters = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
