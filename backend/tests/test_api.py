from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_list_simulations():
    response = client.get("/api/simulations/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_incidents():
    response = client.get("/api/incidents/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_analytics_summary():
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_incidents" in data
    assert "people_affected" in data
