"""
Base agent class for all ResQVerse AI agents.
All agents are deterministic rule-based services — no LLM required.
They return structured JSON with full explainability.
SIMULATION ONLY — agents cannot execute real-world actions.
"""
from datetime import datetime
from typing import Any
import json


class AgentResult:
    def __init__(
        self,
        agent_name: str,
        incident_id: int,
        recommendation: str,
        reasoning: str,
        confidence: float,
        risk_level: str,
        data_used: dict,
        requires_human_approval: bool,
        priority_actions: list[str] | None = None,
        alternatives: list[str] | None = None,
    ):
        self.agent_name = agent_name
        self.incident_id = incident_id
        self.recommendation = recommendation
        self.reasoning = reasoning
        self.confidence = round(confidence, 2)
        self.risk_level = risk_level  # low, medium, high, critical
        self.data_used = data_used
        self.requires_human_approval = requires_human_approval
        self.priority_actions = priority_actions or []
        self.alternatives = alternatives or []
        self.created_at = datetime.utcnow().isoformat()

    def to_dict(self) -> dict:
        return {
            "agent_name": self.agent_name,
            "incident_id": self.incident_id,
            "recommendation": self.recommendation,
            "reasoning": self.reasoning,
            "confidence": self.confidence,
            "risk_level": self.risk_level,
            "data_used": self.data_used,
            "requires_human_approval": self.requires_human_approval,
            "priority_actions": self.priority_actions,
            "alternatives": self.alternatives,
            "created_at": self.created_at,
        }


class BaseAgent:
    """Base class that all agents inherit from."""
    name: str = "BaseAgent"

    def run(self, incident: dict, context: dict) -> AgentResult:
        raise NotImplementedError
