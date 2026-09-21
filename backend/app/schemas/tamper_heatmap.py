from pydantic import BaseModel, Field


class HeatmapRegion(BaseModel):
    x: int = Field(
        ...,
        description="Horizontal coordinate of the suspicious region.",
    )

    y: int = Field(
        ...,
        description="Vertical coordinate of the suspicious region.",
    )

    width: int = Field(
        ...,
        description="Width of the suspicious region.",
    )

    height: int = Field(
        ...,
        description="Height of the suspicious region.",
    )

    score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Suspicion score from 0 to 1.",
    )

    severity: str = Field(
        ...,
        description="Region severity: low, medium, or high.",
    )

    reason: str = Field(
        ...,
        description="Reason why the region was flagged.",
    )

    indicator: str = Field(
        ...,
        description="Technical indicator that produced the region.",
    )


class TamperHeatmapResponse(BaseModel):
    document_id: str

    original_filename: str

    mime_type: str

    width: int

    height: int

    region_count: int

    regions: list[HeatmapRegion]

    heatmap_status: str = "completed"