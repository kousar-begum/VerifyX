from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.supabase import get_supabase_service
from app.services.metadata_service import (
    MetadataAnalysisError,
    metadata_service,
)


router = APIRouter(
    prefix="/analysis",
    tags=["Document Analysis"],
)


class MetadataResponse(BaseModel):
    document_id: str
    original_filename: str
    mime_type: str
    document_type: str
    page_count: int | None = None
    metadata: dict[str, Any]
    metadata_status: str = "completed"


@router.post(
    "/documents/{document_id}/metadata",
    response_model=MetadataResponse,
    status_code=status.HTTP_200_OK,
)
def analyze_document_metadata(
    document_id: str,
    current_user=Depends(get_current_user),
) -> MetadataResponse:
    try:
        user_id = str(current_user.id)

        response = (
            get_supabase_service()
            .table("documents")
            .select(
                "id,user_id,original_file_name,original_filename,"
                "storage_path,mime_type,file_type"
            )
            .eq("id", document_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        document = response.data

        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        storage_path = document.get("storage_path")

        if not storage_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document storage path is missing.",
            )

        file_bytes = (
            get_supabase_service()
            .storage
            .from_("documents")
            .download(storage_path)
        )

        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document file could not be downloaded.",
            )

        mime_type = (
            document.get("mime_type")
            or document.get("file_type")
            or ""
        )

        filename = (
            document.get("original_file_name")
            or document.get("original_filename")
            or "document"
        )

        result = metadata_service.analyze(
            file_content=file_bytes,
            filename=filename,
            mime_type=mime_type,
        )

        return MetadataResponse(
            document_id=str(document["id"]),
            original_filename=filename,
            mime_type=mime_type,
            document_type=result["document_type"],
            page_count=result.get("page_count"),
            metadata=result["metadata"],
            metadata_status="completed",
        )

    except HTTPException:
        raise

    except MetadataAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Metadata analysis could not be completed.",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Metadata analysis failed.",
        ) from exc