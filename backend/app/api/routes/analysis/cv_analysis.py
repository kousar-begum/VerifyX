from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.supabase import get_supabase_service
from app.services.cv_analysis_service import (
    CVAnalysisError,
    cv_analysis_service,
)


router = APIRouter(
    prefix="/analysis",
    tags=["Document Analysis"],
)


class CVAnalysisResponse(BaseModel):
    document_id: str
    original_filename: str
    mime_type: str
    image_analysis: dict[str, Any]
    cv_analysis_status: str = "completed"


@router.post(
    "/documents/{document_id}/cv",
    response_model=CVAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
def analyze_document_cv(
    document_id: str,
    current_user=Depends(get_current_user),
) -> CVAnalysisResponse:
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

        mime_type = (
            document.get("mime_type")
            or document.get("file_type")
            or ""
        )

        if not mime_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Computer-vision image analysis currently "
                    "supports image documents only."
                ),
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

        filename = (
            document.get("original_file_name")
            or document.get("original_filename")
            or "document"
        )

        result = cv_analysis_service.analyze(
            file_content=file_bytes,
        )

        return CVAnalysisResponse(
            document_id=str(document["id"]),
            original_filename=filename,
            mime_type=mime_type,
            image_analysis=result,
            cv_analysis_status="completed",
        )

    except HTTPException:
        raise

    except CVAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Computer-vision analysis could not be completed.",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Computer-vision analysis failed.",
        ) from exc