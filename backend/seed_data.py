"""
Seed data for ResQVerse AI — Chennai, Tamil Nadu
All data is SIMULATED for educational/demonstration purposes.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import (
    Incident, Hospital, Shelter, Responder, Resource,
    IoTSensor, Drone, AgentRecommendation, AuditLog,
    SimulationScenario
)


def seed_incidents(db: Session):
    incidents = [
        Incident(
            title="Adyar River Flash Flood",
            description="Heavy monsoon rainfall has caused the Adyar River to overflow, flooding low-lying residential areas in Adyar and Velachery. Approximately 2,400 residents are affected.",
            disaster_type="flood",
            severity="critical",
            status="active",
            latitude=13.0067,
            longitude=80.2206,
            location_name="Adyar, Chennai",
            affected_population=2400,
            created_by="system",
            is_simulated=True,
        ),
        Incident(
            title="Structural Collapse — T. Nagar Building",
            description="A three-storey residential building has partially collapsed in T. Nagar following heavy rains weakening its foundation. Residents may be trapped.",
            disaster_type="earthquake",
            severity="high",
            status="active",
            latitude=13.0418,
            longitude=80.2341,
            location_name="T. Nagar, Chennai",
            affected_population=150,
            created_by="system",
            is_simulated=True,
        ),
        Incident(
            title="Chemical Leak — Manali Industrial Zone",
            description="A minor chemical leak at a manufacturing plant in Manali has released airborne irritants. Evacuation of a 500-metre radius has been initiated.",
            disaster_type="chemical_leak",
            severity="high",
            status="active",
            latitude=13.1667,
            longitude=80.2556,
            location_name="Manali, Chennai",
            affected_population=820,
            created_by="system",
            is_simulated=True,
        ),
        Incident(
            title="Cyclone Vayu — Coastal Surge Warning",
            description="Cyclone Vayu is approaching the Chennai coast with expected landfall in 18 hours. Coastal communities in Marina and Besant Nagar are being evacuated.",
            disaster_type="cyclone",
            severity="critical",
            status="monitoring",
            latitude=13.0500,
            longitude=80.2824,
            location_name="Marina Beach, Chennai",
            affected_population=15000,
            created_by="system",
            is_simulated=True,
        ),
        Incident(
            title="Wildfire — Guindy National Park Periphery",
            description="A fire has broken out at the periphery of Guindy National Park, spreading due to dry vegetation. Fire containment teams have been deployed.",
            disaster_type="wildfire",
            severity="medium",
            status="active",
            latitude=13.0067,
            longitude=80.2100,
            location_name="Guindy, Chennai",
            affected_population=300,
            created_by="system",
            is_simulated=True,
        ),
    ]
    for inc in incidents:
        db.add(inc)
    db.commit()
    print(f"Seeded {len(incidents)} incidents.")


def seed_hospitals(db: Session):
    hospitals = [
        Hospital(name="Rajiv Gandhi Government General Hospital", address="Park Town, Chennai 600003", latitude=13.0843, longitude=80.2705, total_beds=2300, available_beds=312, icu_beds=120, available_icu=18, contact_number="+91-44-25305000"),
        Hospital(name="Stanley Medical College Hospital", address="Old Jail Rd, Chennai 600001", latitude=13.1000, longitude=80.2869, total_beds=1500, available_beds=210, icu_beds=80, available_icu=11, contact_number="+91-44-25281801"),
        Hospital(name="Apollo Hospitals Greams Road", address="21 Greams Lane, Chennai 600006", latitude=13.0631, longitude=80.2510, total_beds=700, available_beds=95, icu_beds=60, available_icu=8, contact_number="+91-44-28290200"),
        Hospital(name="MIOT International Hospital", address="4/112 Mt Poonamallee Rd, Chennai 600089", latitude=13.0569, longitude=80.1697, total_beds=1000, available_beds=130, icu_beds=90, available_icu=14, contact_number="+91-44-42002288"),
        Hospital(name="Fortis Malar Hospital", address="52 1st Main Rd, Adyar, Chennai 600020", latitude=13.0063, longitude=80.2529, total_beds=450, available_beds=62, icu_beds=40, available_icu=5, contact_number="+91-44-42892222"),
        Hospital(name="Sri Ramachandra Institute of Higher Education", address="Porur, Chennai 600116", latitude=13.0353, longitude=80.1581, total_beds=900, available_beds=105, icu_beds=75, available_icu=9, contact_number="+91-44-45928500"),
    ]
    for h in hospitals:
        h.is_simulated = True
        db.add(h)
    db.commit()
    print(f"Seeded {len(hospitals)} hospitals.")


def seed_shelters(db: Session):
    shelters = [
        Shelter(name="Nehru Indoor Stadium Shelter", address="Periamet, Chennai 600003", latitude=13.0900, longitude=80.2793, total_capacity=2000, current_occupancy=1240, has_medical=True, has_food=True, contact_person="Mr. Selvam Rajan"),
        Shelter(name="YMCA Nandanam Community Centre", address="Nandanam, Chennai 600035", latitude=13.0296, longitude=80.2209, total_capacity=800, current_occupancy=512, has_medical=False, has_food=True, contact_person="Ms. Priya Krishnan"),
        Shelter(name="Kalaivanar Arangam Auditorium", address="Anna Salai, Chennai 600006", latitude=13.0651, longitude=80.2534, total_capacity=1500, current_occupancy=890, has_medical=True, has_food=True, contact_person="Mr. Arun Kumar"),
        Shelter(name="Velachery Community Hall", address="Velachery, Chennai 600042", latitude=12.9815, longitude=80.2180, total_capacity=600, current_occupancy=420, has_medical=False, has_food=True, contact_person="Ms. Deepika Nair"),
        Shelter(name="Ambattur Higher Secondary School", address="Ambattur, Chennai 600053", latitude=13.1148, longitude=80.1548, total_capacity=1200, current_occupancy=350, has_medical=True, has_food=True, contact_person="Mr. Senthil Murugan"),
        Shelter(name="Perambur Government School", address="Perambur, Chennai 600011", latitude=13.1116, longitude=80.2386, total_capacity=900, current_occupancy=670, has_medical=False, has_food=True, contact_person="Mr. Balachandran"),
        Shelter(name="Anna Nagar Tower Park Relief Camp", address="Anna Nagar, Chennai 600040", latitude=13.0849, longitude=80.2101, total_capacity=1100, current_occupancy=228, has_medical=True, has_food=True, contact_person="Ms. Meena Subramanian"),
        Shelter(name="Sholinganallur Multipurpose Hall", address="Sholinganallur, Chennai 600119", latitude=12.9010, longitude=80.2279, total_capacity=700, current_occupancy=185, has_medical=False, has_food=True, contact_person="Mr. Karthik Balaji"),
    ]
    for s in shelters:
        s.is_simulated = True
        db.add(s)
    db.commit()
    print(f"Seeded {len(shelters)} shelters.")


def seed_responders(db: Session):
    responders = [
        Responder(name="Ravi Shankar", role="paramedic", status="deployed", latitude=13.0067, longitude=80.2206, team="Team Alpha", specialization="Emergency Medical Care"),
        Responder(name="Lakshmi Devi", role="coordinator", status="available", latitude=13.0843, longitude=80.2705, team="Command HQ", specialization="Incident Command"),
        Responder(name="Murugan Pillai", role="firefighter", status="deployed", latitude=13.0418, longitude=80.2341, team="Fire Unit 3", specialization="Urban Search & Rescue"),
        Responder(name="Ananya Krishnan", role="rescue_diver", status="available", latitude=13.1000, longitude=80.2869, team="Water Rescue Bravo", specialization="Flood Rescue"),
        Responder(name="Suresh Babu", role="paramedic", status="deployed", latitude=13.1667, longitude=80.2556, team="HAZMAT Team 1", specialization="Chemical Decontamination"),
        Responder(name="Deepa Rajendran", role="firefighter", status="available", latitude=13.0631, longitude=80.2510, team="Fire Unit 1", specialization="Wildfire Suppression"),
        Responder(name="Karthik Natarajan", role="coordinator", status="available", latitude=13.0569, longitude=80.1697, team="Logistics Hub", specialization="Supply Chain"),
        Responder(name="Sathya Moorthy", role="rescue_diver", status="deployed", latitude=13.0067, longitude=80.2206, team="Water Rescue Alpha", specialization="Swift Water Rescue"),
        Responder(name="Priya Sundaram", role="paramedic", status="available", latitude=13.0900, longitude=80.2793, team="Medical Team 2", specialization="Triage"),
        Responder(name="Vijay Kumar", role="firefighter", status="deployed", latitude=13.0067, longitude=80.2100, team="Fire Unit 2", specialization="Forest Firefighting"),
        Responder(name="Meena Vasudevan", role="coordinator", status="available", latitude=13.0851, longitude=80.2101, team="Command HQ", specialization="Public Communications"),
        Responder(name="Balaji Narayanan", role="paramedic", status="deployed", latitude=12.9815, longitude=80.2180, team="Medical Team 1", specialization="Trauma Care"),
        Responder(name="Selvi Arumugam", role="rescue_diver", status="available", latitude=13.1148, longitude=80.1548, team="Water Rescue Bravo", specialization="Flood Rescue"),
        Responder(name="Senthil Kumar", role="firefighter", status="available", latitude=13.1116, longitude=80.2386, team="Fire Unit 4", specialization="Industrial Firefighting"),
        Responder(name="Divya Chandrasekaran", role="coordinator", status="deployed", latitude=13.0500, longitude=80.2824, team="Coastal Evacuation Unit", specialization="Mass Evacuation"),
    ]
    for r in responders:
        r.is_simulated = True
        db.add(r)
    db.commit()
    print(f"Seeded {len(responders)} responders.")


def seed_resources(db: Session):
    resources = [
        Resource(name="Ambulance AMB-01", resource_type="vehicle", category="ambulance", status="deployed", latitude=13.0067, longitude=80.2206),
        Resource(name="Ambulance AMB-02", resource_type="vehicle", category="ambulance", status="available", latitude=13.0843, longitude=80.2705),
        Resource(name="Ambulance AMB-03", resource_type="vehicle", category="ambulance", status="available", latitude=13.0900, longitude=80.2793),
        Resource(name="Fire Engine FE-01", resource_type="vehicle", category="fire_truck", status="deployed", latitude=13.0067, longitude=80.2100),
        Resource(name="Fire Engine FE-02", resource_type="vehicle", category="fire_truck", status="available", latitude=13.1000, longitude=80.2869),
        Resource(name="Rescue Boat RB-01", resource_type="vehicle", category="rescue_boat", status="deployed", latitude=13.0067, longitude=80.2206),
        Resource(name="Rescue Boat RB-02", resource_type="vehicle", category="rescue_boat", status="deployed", latitude=13.0296, longitude=80.2209),
        Resource(name="Rescue Boat RB-03", resource_type="vehicle", category="rescue_boat", status="available", latitude=13.1148, longitude=80.1548),
        Resource(name="HAZMAT Response Unit HM-01", resource_type="vehicle", category="hazmat", status="deployed", latitude=13.1667, longitude=80.2556),
        Resource(name="Emergency Medical Supplies Kit", resource_type="medical_supply", category="first_aid", status="available", quantity=50, unit="kits", latitude=13.0843, longitude=80.2705),
        Resource(name="Water Purification Tablets", resource_type="medical_supply", category="water_treatment", status="available", quantity=5000, unit="tablets", latitude=13.0900, longitude=80.2793),
        Resource(name="Emergency Food Ration Pack", resource_type="food", category="food_supply", status="available", quantity=3000, unit="packs", latitude=13.0651, longitude=80.2534),
        Resource(name="Life Jacket (Adult)", resource_type="equipment", category="safety_gear", status="available", quantity=200, unit="units", latitude=13.1148, longitude=80.1548),
        Resource(name="Portable Generator PG-01", resource_type="equipment", category="power", status="available", quantity=5, unit="units", latitude=13.0843, longitude=80.2705),
        Resource(name="Search & Rescue Thermal Camera", resource_type="equipment", category="detection", status="deployed", latitude=13.0418, longitude=80.2341),
        Resource(name="Emergency Tents (Family Size)", resource_type="equipment", category="shelter_material", status="available", quantity=150, unit="tents", latitude=13.0849, longitude=80.2101),
        Resource(name="Mobile Field Hospital Unit MFH-01", resource_type="equipment", category="medical_facility", status="available", latitude=13.0569, longitude=80.1697),
        Resource(name="Emergency Communication Radio Set", resource_type="equipment", category="communication", status="available", quantity=30, unit="sets", latitude=13.0843, longitude=80.2705),
        Resource(name="Coastal Evacuation Bus BUS-01", resource_type="vehicle", category="bus", status="deployed", latitude=13.0500, longitude=80.2824),
        Resource(name="Coastal Evacuation Bus BUS-02", resource_type="vehicle", category="bus", status="available", latitude=13.0900, longitude=80.2793),
    ]
    for r in resources:
        r.is_simulated = True
        db.add(r)
    db.commit()
    print(f"Seeded {len(resources)} resources.")


def seed_sensors(db: Session):
    sensors = [
        IoTSensor(sensor_id="WL-ADY-001", sensor_type="water_level", location_name="Adyar River — Adyar Bridge", latitude=13.0067, longitude=80.2206, status="active", last_reading=4.8, unit="metres", threshold_warning=3.5, threshold_critical=4.5),
        IoTSensor(sensor_id="WL-ADY-002", sensor_type="water_level", location_name="Adyar River — Kotturpuram", latitude=13.0220, longitude=80.2270, status="active", last_reading=4.2, unit="metres", threshold_warning=3.5, threshold_critical=4.5),
        IoTSensor(sensor_id="WL-COO-001", sensor_type="water_level", location_name="Cooum River — Egmore", latitude=13.0800, longitude=80.2651, status="active", last_reading=2.9, unit="metres", threshold_warning=2.5, threshold_critical=3.5),
        IoTSensor(sensor_id="SM-TNR-001", sensor_type="seismic", location_name="T. Nagar Seismic Monitor", latitude=13.0418, longitude=80.2341, status="active", last_reading=2.1, unit="Richter", threshold_warning=3.0, threshold_critical=5.0),
        IoTSensor(sensor_id="AQ-MNL-001", sensor_type="air_quality", location_name="Manali Industrial Zone AQI", latitude=13.1667, longitude=80.2556, status="active", last_reading=185.0, unit="AQI", threshold_warning=100.0, threshold_critical=200.0),
        IoTSensor(sensor_id="AQ-MNL-002", sensor_type="air_quality", location_name="Manali Residential AQI", latitude=13.1580, longitude=80.2500, status="active", last_reading=142.0, unit="AQI", threshold_warning=100.0, threshold_critical=200.0),
        IoTSensor(sensor_id="WX-CHN-001", sensor_type="weather", location_name="Chennai Central Weather Station", latitude=13.0827, longitude=80.2707, status="active", last_reading=95.0, unit="kmh_wind", threshold_warning=60.0, threshold_critical=90.0),
        IoTSensor(sensor_id="WX-BSN-001", sensor_type="weather", location_name="Besant Nagar Coastal Station", latitude=13.0002, longitude=80.2707, status="active", last_reading=112.0, unit="kmh_wind", threshold_warning=60.0, threshold_critical=90.0),
        IoTSensor(sensor_id="FD-GDY-001", sensor_type="fire_detection", location_name="Guindy Park Perimeter Sensor", latitude=13.0067, longitude=80.2100, status="active", last_reading=68.0, unit="degrees_C", threshold_warning=50.0, threshold_critical=65.0),
        IoTSensor(sensor_id="WL-PCC-001", sensor_type="water_level", location_name="Poondi Reservoir Outflow", latitude=13.1000, longitude=80.1000, status="active", last_reading=3.1, unit="metres", threshold_warning=2.8, threshold_critical=3.5),
        IoTSensor(sensor_id="SM-VLY-001", sensor_type="seismic", location_name="Velachery Structural Monitor", latitude=12.9815, longitude=80.2180, status="fault", last_reading=0.0, unit="Richter", threshold_warning=3.0, threshold_critical=5.0),
        IoTSensor(sensor_id="WX-AMB-001", sensor_type="weather", location_name="Ambattur Rainfall Gauge", latitude=13.1148, longitude=80.1548, status="active", last_reading=88.0, unit="mm_per_hour", threshold_warning=50.0, threshold_critical=80.0),
    ]
    for s in sensors:
        s.is_simulated = True
        db.add(s)
    db.commit()
    print(f"Seeded {len(sensors)} IoT sensors.")


def seed_drones(db: Session):
    drones = [
        Drone(drone_id="DRN-001", model="DJI Matrice 300 RTK", status="airborne", latitude=13.0100, longitude=80.2250, altitude=120, battery_level=72, mission="Flood zone reconnaissance — Adyar", assigned_incident_id=1),
        Drone(drone_id="DRN-002", model="DJI Matrice 300 RTK", status="airborne", latitude=13.0450, longitude=80.2300, altitude=80, battery_level=55, mission="Building collapse thermal scan — T. Nagar", assigned_incident_id=2),
        Drone(drone_id="DRN-003", model="Parrot ANAFI USA", status="returning", latitude=13.1600, longitude=80.2500, altitude=50, battery_level=28, mission="Chemical plume mapping — Manali", assigned_incident_id=3),
        Drone(drone_id="DRN-004", model="DJI Phantom 4 RTK", status="standby", latitude=13.0843, longitude=80.2705, altitude=0, battery_level=100, mission="On standby — awaiting deployment", assigned_incident_id=None),
    ]
    for d in drones:
        d.is_simulated = True
        db.add(d)
    db.commit()
    print(f"Seeded {len(drones)} drones.")


def seed_recommendations(db: Session):
    recommendations = [
        AgentRecommendation(
            agent_name="Resource Allocation Agent",
            incident_id=1,
            recommendation="Deploy 3 additional rescue boats and 2 water pumping units to Velachery and Adyar low-lying zones immediately.",
            reasoning="Water level sensors WL-ADY-001 and WL-ADY-002 report levels above critical threshold. 2,400 residents affected. Current rescue boat deployment (2 boats) is insufficient for this scale.",
            confidence=0.91,
            risk_level="critical",
            data_used={"sensors": ["WL-ADY-001", "WL-ADY-002"], "affected_population": 2400, "available_resources": {"rescue_boats": 1}},
            requires_human_approval=True,
            status="pending",
        ),
        AgentRecommendation(
            agent_name="Evacuation Agent",
            incident_id=4,
            recommendation="Initiate mandatory evacuation of Marina Beach and Besant Nagar coastal communities. Estimated 15,000 residents to be moved to Nehru Indoor Stadium and Kalaivanar Arangam shelters.",
            reasoning="Weather sensor WX-BSN-001 reports sustained winds of 112 km/h. Cyclone Vayu landfall expected in 18 hours. Available shelter capacity is 3,500 — supplemental shelters must be activated.",
            confidence=0.97,
            risk_level="critical",
            data_used={"sensors": ["WX-CHN-001", "WX-BSN-001"], "landfall_eta_hours": 18, "affected_population": 15000},
            requires_human_approval=True,
            status="pending",
        ),
        AgentRecommendation(
            agent_name="Medical Triage Agent",
            incident_id=2,
            recommendation="Establish a field triage point at the T. Nagar collapse site. Request immediate dispatch of trauma team from Rajiv Gandhi General Hospital.",
            reasoning="Structural collapse with possible trapped survivors. Urban Search & Rescue reports void spaces detected. Estimated 12 casualties requiring immediate trauma care.",
            confidence=0.85,
            risk_level="high",
            data_used={"incident_type": "structural_collapse", "estimated_casualties": 12, "nearest_hospital_distance_km": 4.2},
            requires_human_approval=True,
            status="approved",
            approved_by="Dr. Lakshmi Devi",
        ),
    ]
    for r in recommendations:
        db.add(r)
    db.commit()
    print(f"Seeded {len(recommendations)} agent recommendations.")


def seed_simulation_scenarios(db: Session):
    scenarios = [
        SimulationScenario(
            name="Chennai Flash Flood (Adyar)",
            scenario_type="flood",
            severity=8,
            parameters={
                "location_name": "Adyar Basin",
                "latitude": 13.0067,
                "longitude": 80.2206,
                "affected_population": 45000,
                "water_level_rise_m": 1.5
            }
        ),
        SimulationScenario(
            name="T. Nagar High-Rise Collapse",
            scenario_type="earthquake",
            severity=7,
            parameters={
                "location_name": "T. Nagar Commercial District",
                "latitude": 13.0418,
                "longitude": 80.2341,
                "affected_population": 800,
                "building_type": "high_rise_commercial"
            }
        ),
        SimulationScenario(
            name="Guindy National Park Wildfire",
            scenario_type="wildfire",
            severity=6,
            parameters={
                "location_name": "Guindy National Park",
                "latitude": 13.0067,
                "longitude": 80.2100,
                "affected_population": 250,
                "wind_speed_kmh": 45
            }
        ),
        SimulationScenario(
            name="Cyclone Category 4 Landfall",
            scenario_type="cyclone",
            severity=9,
            parameters={
                "location_name": "Marina Coastal Belt",
                "latitude": 13.0500,
                "longitude": 80.2824,
                "affected_population": 120000,
                "surge_height_m": 2.2
            }
        ),
        SimulationScenario(
            name="Manali Chemical Plant Leak",
            scenario_type="chemical_leak",
            severity=8,
            parameters={
                "location_name": "Manali Industrial Zone",
                "latitude": 13.1667,
                "longitude": 80.2556,
                "affected_population": 5000,
                "chemical_type": "Ammonia Gas"
            }
        ),
    ]
    for s in scenarios:
        db.add(s)
    db.commit()
    print(f"Seeded {len(scenarios)} simulation scenarios.")


def run_seed(db: Session):
    print("Starting seed process for Chennai, Tamil Nadu (SIMULATED DATA)...")
    seed_incidents(db)
    seed_hospitals(db)
    seed_shelters(db)
    seed_responders(db)
    seed_resources(db)
    seed_sensors(db)
    seed_drones(db)
    seed_recommendations(db)
    seed_simulation_scenarios(db)
    print("Seed complete.")
