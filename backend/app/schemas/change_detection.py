from typing import Any

from pydantic import BaseModel, Field


class ChangeItem(BaseModel):
    change_type: str = Field(
        ...,
        description="Type of detected change.",
    )

    name: str = Field(
        ...,
        description="Human-readable name of the detected change.",
    )

    category: str = Field(
        ...,
        description="Category of the detected change.",
    )

    severity: str = Field(
        ...,
        description="Severity of the detected change.",
    )

    description: str = Field(
        ...,
        description="Explanation of the detected change.",
    )

    document_a_value: Any = Field(
        default=None,
        description="Value detected in document A.",
    )

    document_b_value: Any = Field(
        default=None,
        description="Value detected in document B.",
    )

    similarity: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Similarity for the affected feature.",
    )

    recommended_action: str | None = Field(
        default=None,
        description="Suggested review action.",
    )


class ChangeDetectionResponse(BaseModel):
    document_a_id: str

    document_b_id: str

    overall_similarity: float = Field(
        ...,
        ge=0.0,
        le=1.0,
    )

    changes_detected: int = Field(
        ...,
        ge=0,
    )

    changes: list[ChangeItem] = Field(
        default_factory=list,
    )

    text_changes: list[ChangeItem] = Field(
        default_factory=list,
    )

    metadata_changes: list[ChangeItem] = Field(
        default_factory=list,
    )

    visual_changes: list[ChangeItem] = Field(
        default_factory=list,
    )

    summary: str

    status: str = "completed"