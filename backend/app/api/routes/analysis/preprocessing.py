from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.db.supabase import get_supabase_service
from app.schemas.preprocessing import DocumentPreprocessingResponse
from app.services.document_preprocessing_service import (
    DocumentPreprocessingError,
    document_preprocessing_service,
)


router = APIRouter(
    prefix="/analysis",
    tags=["Document Analysis"],
)


@router.post(
    "/documents/{document_id}/preprocess",
    response_model=DocumentPreprocessingResponse,
    status_code=status.HTTP_200_OK,
)
def preprocess_document(
    document_id: str,
    current_user=Depends(get_current_user),
) -> DocumentPreprocessingResponse:
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

        result = document_preprocessing_service.validate_document(
            file_content=file_bytes,
            filename=filename,
            mime_type=mime_type,
        )

        return DocumentPreprocessingResponse(
            document_id=str(document["id"]),
            original_filename=filename,
            document_type=result["document_type"],
            mime_type=mime_type,
            page_count=result["page_count"],
            width=result.get("width"),
            height=result.get("height"),
            metadata=result.get("metadata", {}),
            preprocessing_status="completed",
        )

    except HTTPException:
        raise

    except DocumentPreprocessingError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document preprocessing could not be completed.",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document preprocessing failed.",
        ) from exc