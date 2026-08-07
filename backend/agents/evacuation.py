from .base import BaseAgent, AgentResult

class EvacuationAgent(BaseAgent):
    name = "EvacuationAgent"

    def run(self, incident: dict, context: dict) -> AgentResult:
        severity = incident.get("severity", "low")
        affected = incident.get("affected_population", 0)
        disaster = incident.get("disaster_type", "unknown")
        
        risk_level = "low"
        confidence = 0.90
        recommendation = "Maintain current monitoring."
        reasoning = f"Population affected is {affected}, which is manageable. Severity is {severity}."
        requires_approval = False
        priority_actions = []

        if severity in ["high", "critical"] or affected > 1000:
            risk_level = "high"
            requires_approval = True
            teams = max(2, affected // 1000)
            if disaster == "flood":
                recommendation = f"Deploy {teams} NDRF teams for immediate evacuation of low-lying areas."
                reasoning = f"Water levels and severity '{severity}' pose immediate risk to {affected} residents."
                priority_actions = ["Issue evacuation order", f"Deploy {teams} NDRF teams"]
                confidence = 0.92
            elif disaster == "chemical_leak":
                recommendation = "Issue immediate shelter-in-place advisory within 2km radius."
                reasoning = f"Toxic plume risk is high for {affected} residents. Evacuation may increase exposure."
                priority_actions = ["Issue shelter-in-place alert", "Distribute protective masks"]
                confidence = 0.88
            else:
                recommendation = f"Initiate phased evacuation for {affected} residents."
                reasoning = f"Severity '{severity}' for disaster '{disaster}' requires clearing the immediate hazard zone."
                priority_actions = ["Establish safe corridors", f"Evacuate {affected} residents"]
                confidence = 0.85
        elif severity == "medium":
            risk_level = "medium"
            requires_approval = True
            recommendation = "Prepare for potential evacuation. Place transport on standby."
            reasoning = f"Severity '{severity}' could escalate. Standby is advised for {affected} people."
            confidence = 0.80

        return AgentResult(
            agent_name=self.name,
            incident_id=incident.get("id", 0),
            recommendation=recommendation,
            reasoning=reasoning,
            confidence=confidence,
            risk_level=risk_level,
            data_used={"severity": severity, "affected_population": affected, "disaster_type": disaster},
            requires_human_approval=requires_approval,
            priority_actions=priority_actions
        )
