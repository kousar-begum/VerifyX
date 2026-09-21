from typing import Any

from pydantic import BaseModel, Field


class ComparisonDifference(BaseModel):
    difference_type: str = Field(
        ...,
        description="Machine-readable type of detected difference.",
    )

    name: str = Field(
        ...,
        description="Human-readable name of the detected difference.",
    )

    category: str = Field(
        ...,
        description="High-level comparison category.",
    )

    severity: str = Field(
        ...,
        description="Difference severity: low, medium, or high.",
    )

    description: str = Field(
        ...,
        description="Explanation of the detected difference.",
    )

    document_a_value: Any = Field(
        default=None,
        description="Relevant value from document A.",
    )

    document_b_value: Any = Field(
        default=None,
        description="Relevant value from document B.",
    )

    similarity: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Similarity between the compared values.",
    )

    recommended_action: str = Field(
        ...,
        description="Recommended action for the detected difference.",
    )


class DocumentComparisonResponse(BaseModel):
    document_a_id: str

    document_b_id: str

    document_a_filename: str

    document_b_filename: str

    document_a_mime_type: str

    document_b_mime_type: str

    overall_similarity: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Overall similarity between the two documents.",
    )

    comparison_status: str = Field(
        ...,
        description="Comparison processing status.",
    )

    differences_count: int = Field(
        ...,
        ge=0,
        description="Number of detected differences.",
    )

    differences: list[ComparisonDifference] = Field(
        default_factory=list,
        description="Detected differences between the two documents.",
    )

    summary: str = Field(
        ...,
        description="Human-readable comparison summary.",
    )

    metadata_comparison: dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata comparison results.",
    )

    text_comparison: dict[str, Any] = Field(
        default_factory=dict,
        description="OCR and text comparison results.",
    )

    image_comparison: dict[str, Any] = Field(
        default_factory=dict,
        description="Computer-vision comparison results.",
    )