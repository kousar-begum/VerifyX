from typing import Any

from pydantic import BaseModel, Field


class AnomalyItem(BaseModel):
    anomaly_type: str = Field(
        ...,
        description="Machine-readable anomaly category.",
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
        description="Anomaly severity: low, medium, or high.",
    )

    description: str = Field(
        ...,
        description="Explanation of the detected anomaly.",
    )

    evidence: dict[str, Any] = Field(
        default_factory=dict,
        description="Measured evidence supporting the anomaly.",
    )

    features: list[str] = Field(
        default_factory=list,
        description="Document features associated with the anomaly.",
    )

    recommended_action: str = Field(
        ...,
        description="Recommended action for the user.",
    )