from typing import Any

from pydantic import BaseModel, Field


class ReportResponse(BaseModel):
    report_id: str
    analysis_id: str
    user_id: str
    report_type: str = Field(..., min_length=1)
    storage_bucket: str = Field(..., min_length=1)
    storage_path: str = Field(..., min_length=1)
    file_name: str = Field(..., min_length=1)
    generated_at: str | None = None


class ReportSummary(BaseModel):
    report_id: str
    analysis_id: str
    report_type: str
    file_name: str
    generated_at: str | None = None


class ReportListResponse(BaseModel):
    reports: list[ReportSummary] = Field(default_factory=list)
    total: int = Field(..., ge=0)


class ReportGenerationResponse(BaseModel):
    report: ReportResponse
    summary: dict[str, Any] = Field(default_factory=dict)
    status: str = "completed"