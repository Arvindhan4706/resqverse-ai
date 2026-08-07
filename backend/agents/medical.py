from .base import BaseAgent, AgentResult

class MedicalAgent(BaseAgent):
    name = "MedicalAgent"

    def run(self, incident: dict, context: dict) -> AgentResult:
        severity = incident.get("severity", "low")
        affected = incident.get("affected_population", 0)
        
        hospital_beds = context.get("hospital_beds_available", 0)
        
        # Simple heuristic for casualties
        casualty_rate = {"low": 0.01, "medium": 0.05, "high": 0.1, "critical": 0.2}.get(severity, 0.01)
        estimated_injuries = int(affected * casualty_rate)
        
        risk_level = "low"
        confidence = 0.88
        requires_approval = False
        recommendation = "Local clinics can handle current medical needs."
        reasoning = f"Estimated injuries ({estimated_injuries}) are well within available hospital capacity ({hospital_beds})."

        if estimated_injuries > hospital_beds:
            risk_level = "critical"
            requires_approval = True
            recommendation = "Deploy 2 Mobile Medical Units (MMUs) and establish forward triage posts."
            reasoning = f"Estimated {estimated_injuries} injuries exceed available hospital beds ({hospital_beds}). Immediate field triage is necessary."
            confidence = 0.92
        elif estimated_injuries > (hospital_beds * 0.5):
            risk_level = "medium"
            requires_approval = True
            recommendation = "Alert nearby hospitals for potential mass casualty influx."
            reasoning = f"Estimated {estimated_injuries} injuries will consume over 50% of available hospital beds ({hospital_beds})."
            confidence = 0.85

        return AgentResult(
            agent_name=self.name,
            incident_id=incident.get("id", 0),
            recommendation=recommendation,
            reasoning=reasoning,
            confidence=confidence,
            risk_level=risk_level,
            data_used={"estimated_injuries": estimated_injuries, "hospital_beds_available": hospital_beds, "severity": severity},
            requires_human_approval=requires_approval
        )
