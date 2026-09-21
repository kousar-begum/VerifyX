from pydantic import BaseModel, Field


class AnalysisHistoryItem(BaseModel):
    analysis_id: str
    document_id: str
    status: str
    risk_score: float | None = None
    risk_level: str
    result_summary: str | None = None
    confidence_score: float | None = None
    insufficient_evidence: bool
    analysis_version: str
    started_at: str | None = None
    completed_at: str | None = None
    created_at: str | None = None


class AnalysisHistoryResponse(BaseModel):
    analyses: list[AnalysisHistoryItem] = Field(
        default_factory=list
    )
    total: int = Field(
        ...,
        ge=0,
    )