from typing import Optional

from pydantic import BaseModel, Field


class DocumentUploadResponse(BaseModel):
    id: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    storage_path: str


class DocumentResponse(BaseModel):
    id: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    storage_path: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int


class DocumentDeleteResponse(BaseModel):
    message: str
    document_id: str


class DocumentDownloadResponse(BaseModel):
    document_id: str
    download_url: str
    expires_in: int = Field(
        ...,
        description="Signed URL validity duration in seconds.",
    )