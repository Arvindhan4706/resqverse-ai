import pytest
from agents.evacuation import EvacuationAgent
from agents.resource import ResourceAgent

def test_evacuation_agent_high_severity():
    agent = EvacuationAgent()
    incident = {
        "id": 1,
        "disaster_type": "flood",
        "severity": "critical",
        "affected_population": 5000
    }
    context = {}
    
    result = agent.run(incident, context)
    
    assert result.agent_name == "EvacuationAgent"
    assert result.risk_level == "high"
    assert result.requires_human_approval is True
    assert "NDRF teams" in result.recommendation
    assert result.confidence > 0.9

def test_evacuation_agent_low_severity():
    agent = EvacuationAgent()
    incident = {
        "id": 2,
        "disaster_type": "flood",
        "severity": "low",
        "affected_population": 500
    }
    context = {}
    
    result = agent.run(incident, context)
    
    assert result.risk_level == "low"
    assert result.requires_human_approval is False

def test_resource_agent_critical_capacity():
    agent = ResourceAgent()
    incident = {
        "id": 3,
        "affected_population": 10000
    }
    context = {
        "shelter_capacity": 2000,
        "shelter_occupancy": 2000
    }
    
    result = agent.run(incident, context)
    
    assert result.risk_level == "critical"
    assert result.requires_human_approval is True
    assert "Open 3 new temporary shelters" in result.recommendation
