from typing import Any, Optional

from pydantic import BaseModel


class DocumentPreprocessingResponse(BaseModel):
    document_id: str
    original_filename: str
    document_type: str
    mime_type: str
    page_count: int
    width: Optional[int] = None
    height: Optional[int] = None
    metadata: dict[str, Any] = {}
    preprocessing_status: str = "completed"