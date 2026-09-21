from typing import Any

from pydantic import BaseModel, Field


class RiskExplanationItem(BaseModel):
    anomaly_type: str = Field(
        ...,
        description="Machine-readable anomaly type.",
    )

    name: str = Field(
        ...,
        description="Human-readable anomaly name.",
    )

    category: str = Field(
        ...,
        description="High-level anomaly category.",
    )

    severity: str = Field(
        ...,
        description="Anomaly severity.",
    )

    explanation: str = Field(
        ...,
        description="Human-readable explanation of the anomaly.",
    )

    evidence: dict[str, Any] = Field(
        default_factory=dict,
        description="Evidence supporting the anomaly.",
    )

    risk_impact: str = Field(
        ...,
        description="Explanation of how the anomaly affects document risk.",
    )

    recommended_action: str = Field(
        ...,
        description="Recommended action for the user.",
    )


class RiskExplanationResponse(BaseModel):
    document_id: str
    original_filename: str
    mime_type: str

    risk_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
    )

    risk_level: str

    overall_explanation: str

    explanations: list[RiskExplanationItem] = Field(
        default_factory=list,
    )

    total_anomalies: int = Field(
        ...,
        ge=0,
    )

    recommended_next_step: str