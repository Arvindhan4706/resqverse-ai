from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal
import models
from seed_data import run_seed

from routes import (
    incidents, hospitals, shelters, resources,
    responders, sensors, drones, recommendations,
    audit, analytics, simulations
)

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResQVerse AI API",
    description="Backend API for the ResQVerse AI Disaster Response Simulation Platform. All data is SIMULATED.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Seed database if empty."""
    db = SessionLocal()
    try:
        count = db.query(models.Incident).count()
        if count == 0:
            print("Database is empty — running seed data...")
            run_seed(db)
        else:
            print(f"Database already has {count} incidents — skipping seed.")
    finally:
        db.close()


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "ResQVerse AI API is running.", "simulation_mode": True}


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "healthy", "simulation_mode": True}


# Register all routers under /api prefix
app.include_router(incidents.router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")
app.include_router(shelters.router, prefix="/api")
app.include_router(resources.router, prefix="/api")
app.include_router(responders.router, prefix="/api")
app.include_router(sensors.router, prefix="/api")
app.include_router(drones.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(simulations.router, prefix="/api")
