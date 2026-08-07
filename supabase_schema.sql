-- Supabase PostgreSQL Schema for ResQVerse AI

CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    disaster_type VARCHAR NOT NULL,
    severity VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'active',
    latitude FLOAT,
    longitude FLOAT,
    location_name VARCHAR,
    affected_population INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR,
    is_simulated BOOLEAN DEFAULT TRUE
);

CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    address VARCHAR,
    latitude FLOAT,
    longitude FLOAT,
    total_beds INTEGER DEFAULT 0,
    available_beds INTEGER DEFAULT 0,
    icu_beds INTEGER DEFAULT 0,
    available_icu INTEGER DEFAULT 0,
    contact_number VARCHAR,
    is_operational BOOLEAN DEFAULT TRUE,
    is_simulated BOOLEAN DEFAULT TRUE
);

CREATE TABLE shelters (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    address VARCHAR,
    latitude FLOAT,
    longitude FLOAT,
    total_capacity INTEGER DEFAULT 0,
    current_occupancy INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    has_medical BOOLEAN DEFAULT FALSE,
    has_food BOOLEAN DEFAULT TRUE,
    contact_person VARCHAR,
    is_simulated BOOLEAN DEFAULT TRUE
);

CREATE TABLE responders (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    role VARCHAR,
    status VARCHAR DEFAULT 'available',
    latitude FLOAT,
    longitude FLOAT,
    team VARCHAR,
    contact_number VARCHAR,
    specialization VARCHAR,
    is_simulated BOOLEAN DEFAULT TRUE
);

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    resource_type VARCHAR,
    category VARCHAR,
    status VARCHAR DEFAULT 'available',
    quantity INTEGER DEFAULT 1,
    unit VARCHAR DEFAULT 'units',
    latitude FLOAT,
    longitude FLOAT,
    assigned_to VARCHAR,
    is_simulated BOOLEAN DEFAULT TRUE
);

CREATE TABLE resource_deployments (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR DEFAULT 'deployed'
);

CREATE TABLE iot_sensors (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR UNIQUE NOT NULL,
    sensor_type VARCHAR,
    location_name VARCHAR,
    latitude FLOAT,
    longitude FLOAT,
    status VARCHAR DEFAULT 'active',
    last_reading FLOAT,
    unit VARCHAR,
    threshold_warning FLOAT,
    threshold_critical FLOAT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_simulated BOOLEAN DEFAULT TRUE
);

CREATE TABLE drones (
    id SERIAL PRIMARY KEY,
    drone_id VARCHAR UNIQUE NOT NULL,
    model VARCHAR,
    status VARCHAR DEFAULT 'standby',
    latitude FLOAT,
    longitude FLOAT,
    altitude FLOAT DEFAULT 0,
    battery_level INTEGER DEFAULT 100,
    mission VARCHAR,
    assigned_incident_id INTEGER REFERENCES incidents(id) ON DELETE SET NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_simulated BOOLEAN DEFAULT TRUE
);

CREATE TABLE agent_recommendations (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR NOT NULL,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    recommendation TEXT,
    reasoning TEXT,
    confidence FLOAT,
    risk_level VARCHAR,
    data_used JSONB,
    requires_human_approval BOOLEAN DEFAULT TRUE,
    status VARCHAR DEFAULT 'pending',
    approved_by VARCHAR,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR NOT NULL,
    entity_type VARCHAR,
    entity_id INTEGER,
    performed_by VARCHAR,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE simulation_scenarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    scenario_type VARCHAR,
    severity INTEGER DEFAULT 5,
    status VARCHAR DEFAULT 'idle',
    parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Seed Data for ResQVerse AI

INSERT INTO incidents (id, title, description, disaster_type, severity, status, latitude, longitude, location_name, affected_population, created_by) VALUES
(1, 'Adyar River Flash Flood', 'Heavy monsoon rainfall has caused the Adyar River to overflow...', 'flood', 'critical', 'active', 13.0067, 80.2206, 'Adyar, Chennai', 2400, 'system'),
(2, 'Structural Collapse — T. Nagar Building', 'A three-storey residential building has partially collapsed...', 'earthquake', 'high', 'active', 13.0418, 80.2341, 'T. Nagar, Chennai', 150, 'system');

INSERT INTO hospitals (id, name, address, latitude, longitude, total_beds, available_beds, icu_beds, available_icu, contact_number) VALUES
(1, 'Rajiv Gandhi Government General Hospital', 'Park Town, Chennai 600003', 13.0843, 80.2705, 2300, 312, 120, 18, '+91-44-25305000'),
(2, 'Apollo Hospitals Greams Road', '21 Greams Lane, Chennai 600006', 13.0631, 80.2510, 700, 95, 60, 8, '+91-44-28290200');

INSERT INTO shelters (id, name, address, latitude, longitude, total_capacity, current_occupancy, has_medical, has_food, contact_person) VALUES
(1, 'Nehru Indoor Stadium Shelter', 'Periamet, Chennai 600003', 13.0900, 80.2793, 2000, 1240, true, true, 'Mr. Selvam Rajan'),
(2, 'Kalaivanar Arangam Auditorium', 'Anna Salai, Chennai 600006', 13.0651, 80.2534, 1500, 890, true, true, 'Mr. Arun Kumar');

INSERT INTO responders (id, name, role, status, latitude, longitude, team, specialization) VALUES
(1, 'Ravi Shankar', 'paramedic', 'deployed', 13.0067, 80.2206, 'Team Alpha', 'Emergency Medical Care'),
(2, 'Lakshmi Devi', 'coordinator', 'available', 13.0843, 80.2705, 'Command HQ', 'Incident Command');

INSERT INTO resources (id, name, resource_type, category, status, latitude, longitude) VALUES
(1, 'Ambulance AMB-01', 'vehicle', 'ambulance', 'deployed', 13.0067, 80.2206),
(2, 'Rescue Boat RB-01', 'vehicle', 'rescue_boat', 'deployed', 13.0067, 80.2206);

INSERT INTO iot_sensors (id, sensor_id, sensor_type, location_name, latitude, longitude, last_reading, unit, threshold_warning, threshold_critical) VALUES
(1, 'WL-ADY-001', 'water_level', 'Adyar River — Adyar Bridge', 13.0067, 80.2206, 4.8, 'metres', 3.5, 4.5),
(2, 'WX-CHN-001', 'weather', 'Chennai Central Weather Station', 13.0827, 80.2707, 95.0, 'kmh_wind', 60.0, 90.0);

INSERT INTO drones (id, drone_id, model, status, latitude, longitude, altitude, battery_level, mission, assigned_incident_id) VALUES
(1, 'DRN-001', 'DJI Matrice 300 RTK', 'airborne', 13.0100, 80.2250, 120, 72, 'Flood zone reconnaissance', 1);

INSERT INTO simulation_scenarios (id, name, scenario_type, severity, parameters) VALUES
(1, 'Chennai Flash Flood (Adyar)', 'flood', 8, '{"location_name": "Adyar Basin", "latitude": 13.0067, "longitude": 80.2206, "affected_population": 45000, "water_level_rise_m": 1.5}'::jsonb);
