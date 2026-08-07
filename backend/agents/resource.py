from .base import BaseAgent, AgentResult

class ResourceAgent(BaseAgent):
    name = "ResourceAgent"

    def run(self, incident: dict, context: dict) -> AgentResult:
        affected = incident.get("affected_population", 0)
        
        # context contains shelter info
        total_capacity = context.get("shelter_capacity", 0)
        current_occupancy = context.get("shelter_occupancy", 0)
        
        occupancy_pct = (current_occupancy / total_capacity * 100) if total_capacity > 0 else 100
        
        risk_level = "low"
        confidence = 0.85
        requires_approval = False
        recommendation = "Current resources are sufficient."
        reasoning = f"Shelter occupancy is at {occupancy_pct:.1f}%. Resources are stable."

        if occupancy_pct > 80:
            risk_level = "high"
            requires_approval = True
            recommendation = "Pre-position 500 water purification tablets and 300 food packs at nearby overflow centers."
            reasoning = f"Shelters are critically full ({occupancy_pct:.1f}%). Expected overflow due to {affected} affected population."
            confidence = 0.89
        elif occupancy_pct > 60:
            risk_level = "medium"
            requires_approval = True
            recommendation = "Review shelter inventory and prepare supply chain for possible demand spike."
            reasoning = f"Shelter occupancy is rising ({occupancy_pct:.1f}%). Standby supplies may be needed soon."
            confidence = 0.82
            
        if affected > 5000 and total_capacity < affected:
            risk_level = "critical"
            requires_approval = True
            recommendation = f"Urgent: Open 3 new temporary shelters. Current capacity ({total_capacity}) cannot support {affected} affected people."
            reasoning = "Massive deficit in shelter capacity compared to affected population."
            confidence = 0.95

        return AgentResult(
            agent_name=self.name,
            incident_id=incident.get("id", 0),
            recommendation=recommendation,
            reasoning=reasoning,
            confidence=confidence,
            risk_level=risk_level,
            data_used={"shelter_occupancy_pct": round(occupancy_pct, 1), "affected_population": affected},
            requires_human_approval=requires_approval
        )
