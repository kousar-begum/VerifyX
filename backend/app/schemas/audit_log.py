from pydantic import BaseModel, Field


class AuditLogCreate(BaseModel):
    action: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )
    entity_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )
    entity_id: str | None = None
    description: str | None = None
    metadata: dict = Field(
        default_factory=dict,
    )


class AuditLogResponse(BaseModel):
    audit_id: str
    user_id: str
    action: str
    entity_type: str
    entity_id: str | None = None
    description: str | None = None
    metadata: dict = Field(
        default_factory=dict,
    )
    created_at: str | None = None