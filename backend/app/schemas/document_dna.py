from typing import Any

from pydantic import BaseModel, Field


class DocumentDNAResponse(BaseModel):
    document_id: str

    analysis_id: str | None = None

    fingerprint: str = Field(
        ...,
        min_length=1,
        description="Deterministic SHA-256 document fingerprint.",
    )

    document_features: dict[str, Any] = Field(
        default_factory=dict,
        description="Core document characteristics.",
    )

    ocr_features: dict[str, Any] = Field(
        default_factory=dict,
        description="OCR-derived document features.",
    )

    metadata_features: dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata-derived document features.",
    )

    computer_vision_features: dict[str, Any] = Field(
        default_factory=dict,
        description="Computer-vision-derived document features.",
    )

    stored: bool = Field(
        ...,
        description="Whether the generated DNA was stored successfully.",
    )

    created_at: str | None = Field(
        default=None,
        description="Database creation timestamp.",
    )