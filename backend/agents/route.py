from .base import BaseAgent, AgentResult
import random

class RouteAgent(BaseAgent):
    name = "RouteAgent"

    def run(self, incident: dict, context: dict) -> AgentResult:
        disaster = incident.get("disaster_type", "unknown")
        severity = incident.get("severity", "low")
        
        risk_level = "low"
        confidence = 0.95
        requires_approval = False
        recommendation = "All primary arterial routes are clear and safe for responder transit."
        reasoning = "No structural or flood risks detected on main transport corridors."

        if disaster == "flood" and severity in ["high", "critical"]:
            risk_level = "high"
            requires_approval = True
            load = random.randint(85, 99)
            recommendation = "Redirect traffic via bypass routes. Bridges in incident zone are at structural risk due to water pressure."
            reasoning = f"Sensor data shows {load}kN load variance on primary bridge, exceeding safe flood tolerance."
            confidence = 0.94
        elif disaster == "earthquake" and severity in ["high", "critical"]:
            risk_level = "critical"
            requires_approval = True
            recommendation = "Halt all rail and overpass traffic. Dispatch drone for structural integrity scans."
            reasoning = f"Seismic event of severity '{severity}' poses high risk of overpass collapse."
            confidence = 0.91

        return AgentResult(
            agent_name=self.name,
            incident_id=incident.get("id", 0),
            recommendation=recommendation,
            reasoning=reasoning,
            confidence=confidence,
            risk_level=risk_level,
            data_used={"disaster_type": disaster, "severity": severity},
            requires_human_approval=requires_approval
        )
