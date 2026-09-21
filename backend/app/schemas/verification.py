from pydantic import BaseModel, Field


class VerificationRequestCreate(BaseModel):
    document_id: str
    analysis_id: str | None = None
    verification_method: str | None = Field(
        default=None,
        max_length=100,
    )
    notes: str | None = None


class VerificationRequestResponse(BaseModel):
    request_id: str
    document_id: str
    analysis_id: str | None = None
    user_id: str
    verification_method: str | None = None
    notes: str | None = None
    status: str
    created_at: str | None = None
    updated_at: str | None = None